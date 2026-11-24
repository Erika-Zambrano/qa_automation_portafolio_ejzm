const LOOPS = new Set(['ForStatement', 'ForOfStatement', 'ForInStatement', 'WhileStatement', 'DoWhileStatement']);
const FUNCTIONS = new Set(['FunctionExpression', 'ArrowFunctionExpression', 'FunctionDeclaration']);
const TEST_MODIFIERS = new Set(['only', 'skip', 'fixme', 'fail', 'slow']);

const expectInfo = (node) => {
  let current = node;
  while (current) {
    if (current.type === 'AwaitExpression') current = current.argument;
    else if (current.type === 'CallExpression') current = current.callee;
    else if (current.type === 'MemberExpression') {
      if (current.object.type === 'Identifier' && current.object.name === 'expect') {
        const soft = current.property.type === 'Identifier' && current.property.name === 'soft' && !current.computed;
        return { identifier: current.object, soft, member: soft ? current : null };
      }
      current = current.object;
    } else if (current.type === 'Identifier' && current.name === 'expect') {
      return { identifier: current, soft: false, member: null };
    } else return null;
  }
  return null;
};

const expectOfStatement = (statement) => (statement.type === 'ExpressionStatement' ? expectInfo(statement.expression) : null);
const awaitedExpectOfStatement = (statement) => (statement.type === 'ExpressionStatement' && statement.expression.type === 'AwaitExpression' ? expectInfo(statement.expression) : null);

const isPromiseAll = (node) =>
  node.type === 'CallExpression' &&
  node.callee.type === 'MemberExpression' &&
  node.callee.object.type === 'Identifier' &&
  node.callee.object.name === 'Promise' &&
  node.callee.property.type === 'Identifier' &&
  node.callee.property.name === 'all';

const isTestCallback = (fn) => {
  const call = fn.parent;
  if (!call || call.type !== 'CallExpression' || call.arguments[call.arguments.length - 1] !== fn) return false;
  const { callee } = call;
  if (callee.type === 'Identifier') return callee.name === 'test';
  return callee.type === 'MemberExpression' && callee.object.type === 'Identifier' && callee.object.name === 'test' && callee.property.type === 'Identifier' && TEST_MODIFIERS.has(callee.property.name);
};

const isForEachCallback = (fn) => {
  const call = fn.parent;
  return call?.type === 'CallExpression' && call.callee.type === 'MemberExpression' && call.callee.property.type === 'Identifier' && ['forEach', 'map'].includes(call.callee.property.name);
};

export default {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    schema: [],
    messages: {
      group: 'Consecutive expects must be grouped in await Promise.all([...]) using expect.soft',
      promiseSoft: 'Expects inside Promise.all must use expect.soft',
      loopSoft: 'Expects inside a loop must use expect.soft so every iteration is checked',
      notLastSoft: 'Only the last expect of a test may be a hard expect; use expect.soft',
      lastHard: 'The last expect of a test must not use .soft',
    },
  },
  create(context) {
    const { sourceCode } = context;

    const makeSoft = (info) => (fixer) => fixer.insertTextAfter(info.identifier, '.soft');
    const makeHard = (info) => (fixer) => fixer.removeRange([info.identifier.range[1], info.member.range[1]]);

    const toSoftText = (node) => {
      const text = sourceCode.getText(node);
      if (/^expect\.soft\(/.test(text)) return text;
      return text.startsWith('expect(') ? `expect.soft(${text.slice('expect('.length)}` : text;
    };

    const context_of = (statement) => {
      let node = statement.parent;
      let child = statement;
      while (node) {
        if (LOOPS.has(node.type)) return { loop: true };
        if (FUNCTIONS.has(node.type)) {
          if (isForEachCallback(node)) return { loop: true };
          return { loop: false, fn: node, direct: child === node.body || (child.parent === node.body && node.body.type === 'BlockStatement') };
        }
        child = node;
        node = node.parent;
      }
      return { loop: false };
    };

    const checkBlock = (body) => {
      let index = 0;
      while (index < body.length) {
        if (!awaitedExpectOfStatement(body[index])) {
          index += 1;
          continue;
        }
        let end = index;
        while (end + 1 < body.length && awaitedExpectOfStatement(body[end + 1]) && sourceCode.getCommentsBefore(body[end + 1]).length === 0) end += 1;
        if (end > index) {
          const run = body.slice(index, end + 1);
          const convertible = run.every((statement) => statement.expression.type === 'AwaitExpression' && /^expect(\.soft)?\(/.test(sourceCode.getText(statement.expression.argument)));
          context.report({
            node: run[1],
            messageId: 'group',
            fix: convertible
              ? (fixer) => {
                  const indent = ' '.repeat(run[0].loc.start.column);
                  const items = run.map((statement) => `${indent}  ${toSoftText(statement.expression.argument)},`).join('\n');
                  return fixer.replaceTextRange([run[0].range[0], run[run.length - 1].range[1]], `await Promise.all([\n${items}\n${indent}]);`);
                }
              : null,
          });
        }
        index = end + 1;
      }
    };

    return {
      BlockStatement: (node) => checkBlock(node.body),

      ExpressionStatement(statement) {
        const info = expectOfStatement(statement);
        if (!info) return;
        info.awaited = statement.expression.type === 'AwaitExpression';
        const where = context_of(statement);
        if (where.loop) {
          if (!info.soft) context.report({ node: statement, messageId: 'loopSoft', fix: makeSoft(info) });
          return;
        }
        if (!where.fn || !isTestCallback(where.fn) || statement.parent !== where.fn.body) return;
        const body = where.fn.body.body;
        const siblingExpect = (offset) => {
          const sibling = body[body.indexOf(statement) + offset];
          return sibling ? awaitedExpectOfStatement(sibling) : null;
        };
        if (info.awaited && (siblingExpect(-1) || siblingExpect(1))) return;
        const isLast = body[body.length - 1] === statement;
        if (isLast && info.soft) context.report({ node: statement, messageId: 'lastHard', fix: makeHard(info) });
        if (!isLast && !info.soft) context.report({ node: statement, messageId: 'notLastSoft', fix: makeSoft(info) });
      },

      CallExpression(node) {
        if (!isPromiseAll(node) || node.arguments[0]?.type !== 'ArrayExpression') return;
        for (const element of node.arguments[0].elements) {
          if (!element) continue;
          const info = expectInfo(element);
          if (info && !info.soft) context.report({ node: element, messageId: 'promiseSoft', fix: makeSoft(info) });
        }
      },
    };
  },
};
