import { type Page, type Locator } from '@playwright/test';
import { PortfolioBasePage, type Lang } from './PortfolioBasePage';

export class CvPage extends PortfolioBasePage {
  readonly sectionProfile: Locator;
  readonly sectionExperience: Locator;
  readonly sectionProjects: Locator;
  readonly sectionSkills: Locator;
  readonly sectionEducation: Locator;
  readonly sectionLanguages: Locator;

  constructor(page: Page, lang: Lang = 'es') {
    super(page, lang);
    this.sectionProfile = page.getByTestId('section-profile');
    this.sectionExperience = page.getByTestId('section-experience');
    this.sectionProjects = page.getByTestId('section-projects');
    this.sectionSkills = page.getByTestId('section-skills');
    this.sectionEducation = page.getByTestId('section-education');
    this.sectionLanguages = page.getByTestId('section-languages');
  }

  async goto(lang: Lang = this.lang): Promise<void> {
    await this.navigate(`/cv?lang=${lang}`);
  }

  get allSections(): Locator[] {
    return [
      this.sectionProfile,
      this.sectionExperience,
      this.sectionProjects,
      this.sectionSkills,
      this.sectionEducation,
      this.sectionLanguages,
    ];
  }
}
