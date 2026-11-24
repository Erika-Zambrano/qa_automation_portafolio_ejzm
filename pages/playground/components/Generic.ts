import { type Locator, type Page } from '@playwright/test';

export class Generic {
  constructor(private readonly page: Page) {}

  button(name: string | RegExp): Locator {
    return this.page.getByRole('button', { name });
  }

  link(name: string | RegExp): Locator {
    return this.page.getByRole('link', { name });
  }

  textbox(name: string | RegExp): Locator {
    return this.page.getByRole('textbox', { name });
  }

  checkbox(name: string | RegExp): Locator {
    return this.page.getByRole('checkbox', { name });
  }

  heading(name: string | RegExp): Locator {
    return this.page.getByRole('heading', { name });
  }

  text(text: string | RegExp): Locator {
    return this.page.getByText(text);
  }

  testId(id: string): Locator {
    return this.page.getByTestId(id);
  }
}
