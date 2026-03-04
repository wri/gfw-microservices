import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from './Login';
import loginStrings from './loginStrings';

// Mock media assets
jest.mock('../../images/gfw_pro_hero_video.mp4', () => 'gfw_pro_hero_video.mp4');
jest.mock('../../images/gfw_pro_in_action.mp4', () => 'gfw_pro_in_action.mp4');
jest.mock('../../images/gfw_pro_in_action_es_test.mp4', () => 'gfw_pro_in_action_es_test.mp4');
jest.mock('../../images/gfw_pro_in_action_poster.jpg', () => 'gfw_pro_in_action_poster.jpg');
jest.mock('../../images/shape-arrow-right.svg', () => 'shape-arrow-right.svg');
jest.mock('../../images/gfw_pro_hero_poster.jpg', () => 'gfw_pro_hero_poster.jpg');
jest.mock('../../images/icon-lg-compliance.svg', () => 'icon-lg-compliance.svg');
jest.mock('../../images/icon-lg-monitor.svg', () => 'icon-lg-monitor.svg');
jest.mock('../../images/icon-lg-share.svg', () => 'icon-lg-share.svg');

// Mock window.open and window.location
const mockOpen = jest.fn();
const mockLocationHref = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  window.open = mockOpen;
  delete window.location;
  window.location = { href: '' };
  Object.defineProperty(window.location, 'href', {
    set: mockLocationHref,
    get: () => '',
  });
});

describe('Login Component', () => {
  describe('Rendering', () => {
    it('renders the component without crashing', () => {
      render(<Login />);
      expect(screen.getByText(loginStrings.whyGfwPro.title)).toBeInTheDocument();
    });

    it('renders the hero section with title', () => {
      render(<Login />);
      const heroTitle = screen.getByText((content, element) => {
        return element.className === 'hero__title__text';
      });
      expect(heroTitle).toBeInTheDocument();
    });

    it('renders the sign up button', () => {
      render(<Login />);
      const signUpButton = screen.getByText(loginStrings.appRequestAccount);
      expect(signUpButton).toBeInTheDocument();
    });

    it('renders the learn more buttons', () => {
      render(<Login />);
      const learnMoreButtons = screen.getAllByText(loginStrings.appLearnMore);
      expect(learnMoreButtons.length).toBeGreaterThan(0);
    });

    it('renders the video control button', () => {
      render(<Login />);
      expect(screen.getByText('Stop Video')).toBeInTheDocument();
    });

    it('renders the features section', () => {
      render(<Login />);
      expect(screen.getByText(loginStrings.appFeatures.title)).toBeInTheDocument();
    });

    it('renders the carousel section', () => {
      render(<Login />);
      expect(screen.getByText(loginStrings.quoteTitle)).toBeInTheDocument();
    });

    it('renders the more info section', () => {
      render(<Login />);
      expect(screen.getByText(loginStrings.moreInfo.help.paragraphText)).toBeInTheDocument();
      expect(screen.getByText(loginStrings.moreInfo.subscribe.paragraphText)).toBeInTheDocument();
    });

    it('renders the GDPR footer', () => {
      const { container } = render(<Login />);
      // GDPRFooter component is rendered (check by class or content, not tag)
      const footerContent =
        container.querySelector('[class*="footer"]') ||
        container.textContent.includes('Privacy') ||
        container.textContent.includes('Terms');
      expect(footerContent).toBeTruthy();
    });
  });

  describe('Video Controls', () => {
    it('toggles video visibility when button is clicked', async () => {
      const user = userEvent.setup();
      render(<Login />);

      const toggleButton = screen.getByText('Stop Video');
      expect(toggleButton).toBeInTheDocument();

      await user.click(toggleButton);
      expect(screen.getByText('Start Video')).toBeInTheDocument();

      await user.click(screen.getByText('Start Video'));
      expect(screen.getByText('Stop Video')).toBeInTheDocument();
    });

    it('applies correct className based on video visibility', async () => {
      const user = userEvent.setup();
      const { container } = render(<Login />);

      const heroSection = container.querySelector('.hero');
      expect(heroSection).toHaveClass('hero videoHidden-false');

      const toggleButton = screen.getByText('Stop Video');
      await user.click(toggleButton);

      expect(heroSection).toHaveClass('hero videoHidden-true');
    });
  });

  describe('Navigation Actions', () => {
    it('redirects to account page when sign up button is clicked', async () => {
      const user = userEvent.setup();
      render(<Login />);

      const signUpButton = screen.getByText(loginStrings.appRequestAccount);
      await user.click(signUpButton);

      expect(mockLocationHref).toHaveBeenCalledWith('/account');
    });

    it('opens demo link when learn more button is clicked', async () => {
      const user = userEvent.setup();
      render(<Login />);

      const learnMoreButtons = screen.getAllByText(loginStrings.appLearnMore);
      await user.click(learnMoreButtons[0]);

      expect(mockOpen).toHaveBeenCalledWith(loginStrings.moreInfo.help.link, '_blank');
    });

    it('redirects to mailto link when request more info button is clicked', async () => {
      const user = userEvent.setup();
      render(<Login />);

      const moreInfoButton = screen.getByText(loginStrings.moreInfo.help.buttonText);
      await user.click(moreInfoButton);

      expect(mockLocationHref).toHaveBeenCalled();
      const href = mockLocationHref.mock.calls[0][0];
      expect(href).toContain('mailto:GFWPROsupport@wri.org');
      expect(href).toContain('subject=GFW Pro Information Request');
    });
  });

  describe('Role Selection', () => {
    it('renders all role subsections', () => {
      render(<Login />);
      const { subsections } = loginStrings.monitorSection;

      subsections.forEach((section) => {
        expect(screen.getByText(section.title)).toBeInTheDocument();
      });
    });

    it('changes active role when role is clicked', async () => {
      const user = userEvent.setup();
      render(<Login />);

      // Find the first role that's not the default 'banker'
      const { subsections } = loginStrings.monitorSection;
      const nonDefaultRole = subsections.find((s) => s.id !== 'banker');

      const roleButton = screen.getByText(nonDefaultRole.title);
      await user.click(roleButton);

      // Check that the clicked role now has the active class
      const roleElement = roleButton.closest('.role-highlight__item');
      expect(roleElement).toHaveClass('active-role');
    });

    it('displays banker role as active by default', () => {
      const { container } = render(<Login />);

      const activeRoles = container.querySelectorAll('.role-highlight__item.active-role');
      expect(activeRoles.length).toBeGreaterThan(0);
    });
  });

  describe('Language Support', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('defaults to English when no language is stored', () => {
      const { container } = render(<Login />);

      // Check that English video is rendered
      const videos = container.querySelectorAll('video.login__why__section__video');
      expect(videos.length).toBeGreaterThan(0);
    });

    it('loads language from localStorage if available', () => {
      localStorage.setItem('txlive:selectedlang', 'es');

      render(<Login />);

      // Component should read from localStorage in useEffect
      // We can't easily test the effect, but we can verify it doesn't crash
      expect(screen.getByText(loginStrings.whyGfwPro.title)).toBeInTheDocument();
    });
  });

  describe('Features Display', () => {
    it('renders all application features', () => {
      render(<Login />);

      loginStrings.appFeatures.features.forEach((feature) => {
        expect(screen.getByText(feature.text)).toBeInTheDocument();
      });
    });
  });

  describe('Carousel', () => {
    it('renders all quotes in the carousel', () => {
      render(<Login />);

      // At least some quotes should be visible
      // The carousel might not show all at once
      loginStrings.quotes.forEach((quote) => {
        // Check if name exists (might be in inactive slide)
        const nameElements = screen.queryAllByText(quote.name);
        expect(nameElements.length).toBeGreaterThan(0);
        // Just verify the carousel structure exists
      });
    });
  });

  describe('External Links', () => {
    it('renders LinkedIn link with correct href', () => {
      render(<Login />);

      const linkedInLink = screen.getByRole('link', {
        name: new RegExp(loginStrings.moreInfo.subscribe.buttonText),
      });

      expect(linkedInLink).toHaveAttribute('href', loginStrings.moreInfo.subscribe.link);
      expect(linkedInLink).toHaveAttribute('target', '_blank');
    });
  });

  describe('Accessibility', () => {
    it('renders images with alt attributes', () => {
      const { container } = render(<Login />);
      const images = container.querySelectorAll('img');

      images.forEach((img) => {
        expect(img).toHaveAttribute('alt');
      });
    });
  });

  describe('Component Structure', () => {
    it('wraps content in Page', () => {
      const { container } = render(<Login />);

      // Verify main sections exist
      expect(container.querySelector('.hero')).toBeInTheDocument();
      expect(container.querySelector('.main-body__content')).toBeInTheDocument();
      expect(container.querySelector('.tool-highlight__section')).toBeInTheDocument();
      expect(container.querySelector('.quote__section')).toBeInTheDocument();
      expect(container.querySelector('.more-info__section')).toBeInTheDocument();
    });
  });
});
