import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToStaticMarkup } from 'react-dom/server.node';
import App from './App';
import FourierName from './components/FourierName/FourierName';
import Contact from './components/Contact/Contact';
import Publications from './components/Publications/Publications';

const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
const dialogPrototype = Object.getPrototypeOf(document.createElement('dialog'));
const showModalDescriptor = Object.getOwnPropertyDescriptor(dialogPrototype, 'showModal');
const closeDescriptor = Object.getOwnPropertyDescriptor(dialogPrototype, 'close');

beforeAll(() => {
  jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  Object.defineProperties(dialogPrototype, {
    showModal: { configurable: true, value() { this.setAttribute('open', ''); } },
    close: { configurable: true, value() { this.removeAttribute('open'); } },
  });
});

afterEach(() => {
  window.history.replaceState(null, '', '/');
  if (clipboardDescriptor) Object.defineProperty(navigator, 'clipboard', clipboardDescriptor);
  else delete navigator.clipboard;
});

afterAll(() => {
  jest.restoreAllMocks();
  if (showModalDescriptor) Object.defineProperty(dialogPrototype, 'showModal', showModalDescriptor);
  else delete dialogPrototype.showModal;
  if (closeDescriptor) Object.defineProperty(dialogPrototype, 'close', closeDescriptor);
  else delete dialogPrototype.close;
});

test('does not pre-render a filled or outlined name before autoplay starts', () => {
  const autoplay = renderToStaticMarkup(<FourierName headingId="name" paused={false} />);
  const paused = renderToStaticMarkup(<FourierName headingId="name" paused />);
  expect(autoplay).toContain('<canvas');
  expect(autoplay).not.toContain('fourier-static');
  expect(autoplay).not.toContain('<path');
  expect(paused).toContain('fourier-static');
});

test('keeps the name readable while removing the unwanted hero labels and controls', () => {
  const { container } = render(<App />);
  const heading = screen.getByRole('heading', { level: 1, name: 'My name is SWAPNIK' });
  expect(heading).toBeVisible();
  expect(heading.closest('.hero-copy')).not.toBeNull();
  expect(container.querySelector('.fourier-static')).toBeInTheDocument();
  expect(screen.getByText('Name animation unavailable. Showing the static name.')).toBeVisible();
  expect(screen.queryByRole('group', { name: 'Name animation controls' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /name animation/ })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Swapnik Varala, home' })).not.toBeInTheDocument();
  expect(screen.queryByText('AI RESEARCH & ENGINEERING')).not.toBeInTheDocument();
});

test('places the portrait in the right visual column and preserves the PROSE introduction', () => {
  render(<App />);
  const hero = within(screen.getByRole('region', { name: 'My name is SWAPNIK' }));
  const portrait = hero.getByRole('img', { name: 'Illustrated portrait of Varala Nandu Swapnik' });
  const heading = hero.getByRole('heading', { level: 1, name: 'My name is SWAPNIK' });
  expect(portrait).toBeVisible();
  expect(portrait.closest('.hero-art')).not.toBeNull();
  expect(heading.closest('.hero-copy')).not.toBeNull();
  expect(hero.getByText('Microsoft India (R&D) Pvt Ltd')).toBeVisible();
  expect(hero.getByText('Excel Copilot')).toBeVisible();
  expect(hero.getByText('IIT Kharagpur in 2025')).toBeVisible();
  expect(hero.getByRole('link', { name: 'Research Fellow' })).toHaveAttribute('href', 'https://www.microsoft.com/en-us/research/people/t-nvarala/');
  expect(hero.getByRole('link', { name: 'PROSE team' })).toHaveAttribute('href', 'https://www.microsoft.com/en-us/research/group/prose/');
  expect(hero.getByRole('link', { name: 'Microsoft Research India' })).toHaveAttribute('href', 'https://www.microsoft.com/en-us/research/lab/microsoft-research-india/');
  expect(hero.getByRole('link', { name: 'Agentic Shiksha' })).toHaveAttribute('href', 'https://github.com/microsoft/Agentic-Shiksha/');
  expect(hero.getByRole('link', { name: 'Project EKALAIVA' })).toHaveAttribute('href', 'https://medium.com/@swamimanohar_73269/project-ekalaiva-the-six-pillars-of-educational-transformation-9e7c022b2964');
  const mentor = hero.getByRole('link', { name: 'Manohar Swaminathan' });
  expect(mentor).toHaveAttribute('href', 'https://www.microsoft.com/en-us/research/people/swmanohmicrosoft-com/');
  expect(mentor.closest('p')).toHaveTextContent(/^Previously, I was a Research Engineer at Microsoft Research India, working on Agentic Shiksha, an Agentic AI powered educational platform twinned with Project EKALAIVA, under the mentorship of Manohar Swaminathan\.$/);
  const researchAreas = hero.getByText('federated learning, machine unlearning, multimodal AI, NLP, and 2D & 3D computer vision');
  expect(researchAreas.closest('p')).toHaveTextContent(/^My research spans federated learning, machine unlearning, multimodal AI, NLP, and 2D & 3D computer vision, with experience at Sarvam AI, NTU Singapore, and IIT Hyderabad, and publications in federated learning at workshops associated with IEEE INFOCOM 2025 and AAAI 2025\.$/);
  expect(hero.getByText('frontier model training, optimization, and robot learning')).toBeVisible();
});

test('keeps the employment timeline in Experience instead of the introduction', () => {
  render(<App />);
  const hero = within(screen.getByRole('region', { name: 'My name is SWAPNIK' }));
  const experience = within(screen.getByRole('region', { name: /Different teams/ }));

  expect(hero.getAllByText('Research Fellow')).toHaveLength(1);
  expect(hero.queryByText('October 2026 - present / Previously Research Engineer')).not.toBeInTheDocument();
  expect(experience.getByRole('heading', { name: 'Research Fellow' })).toBeVisible();
  expect(experience.getByText('Oct 2026 - present', { selector: '.experience-period' })).toBeVisible();
});

test('provides the five contact and profile links below the introduction', () => {
  render(<App />);
  const links = within(screen.getByRole('group', { name: 'Contact and profile links' }));
  expect(links.getAllByRole('link').map(link => link.textContent.trim())).toEqual(['Email', 'CV', 'Google Scholar', 'GitHub', 'LinkedIn']);
  expect(links.getByRole('link', { name: 'Email' })).toHaveAttribute('href', 'mailto:swapnikvarala@gmail.com');
  const cv = links.getByRole('link', { name: 'CV' });
  expect(cv).toHaveAttribute('href', '/media/Swapnik%20Resume.pdf');
  expect(cv).toHaveAttribute('target', '_blank');
  expect(links.getByRole('link', { name: 'Google Scholar' })).toHaveAttribute('href', 'https://scholar.google.com/citations?user=qTU92b8AAAAJ&hl=en');
  expect(links.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/swapnik-iitkgp');
  expect(links.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', 'https://www.linkedin.com/in/swapnik-varala/');
});

test('removes legacy hero actions and the header Resume link while keeping work navigation', () => {
  render(<App />);
  const hero = within(screen.getByRole('region', { name: 'My name is SWAPNIK' }));
  const navigation = within(screen.getByRole('navigation', { name: 'Primary navigation' }));

  expect(hero.queryByRole('link', { name: 'Explore my work' })).not.toBeInTheDocument();
  expect(hero.queryByRole('link', { name: 'Download resume' })).not.toBeInTheDocument();
  expect(navigation.getByRole('link', { name: 'Work' })).toHaveAttribute('href', '#projects');
  expect(navigation.queryByRole('link', { name: 'Resume' })).not.toBeInTheDocument();
});

test('switches between industry, research, and leadership experience', () => {
  render(<App />);
  const experience = within(screen.getByRole('region', { name: /Different teams/ }));
  const filters = within(experience.getByRole('group', { name: 'Filter experience' }));

  expect(experience.getByRole('heading', { name: 'Research Fellow' })).toBeVisible();
  expect(experience.getByText('Oct 2026 - present', { selector: '.experience-period' })).toBeVisible();
  userEvent.click(filters.getByRole('button', { name: /Research/ }));
  expect(experience.getByText('Nanyang Technological University')).toBeVisible();
  expect(experience.queryByRole('heading', { name: 'Research Fellow' })).not.toBeInTheDocument();
  expect(filters.getByRole('button', { name: /Research/ })).toHaveAttribute('aria-pressed', 'true');

  userEvent.click(filters.getByRole('button', { name: /Leadership/ }));
  expect(experience.getByText('Chess Club, IIT Kharagpur')).toBeVisible();
  expect(experience.queryByText('Nanyang Technological University')).not.toBeInTheDocument();
  userEvent.click(filters.getByRole('button', { name: /Industry/ }));
  expect(experience.getByRole('heading', { name: 'Research Fellow' })).toBeVisible();
});

test('filters selected projects and restores all work', () => {
  render(<App />);
  const projects = within(screen.getByRole('region', { name: /From questions/ }));
  const filters = within(projects.getByRole('group', { name: 'Filter projects' }));

  userEvent.click(filters.getByRole('button', { name: 'Model learning' }));
  expect(projects.getByRole('heading', { name: 'Few-shot concept erasure' })).toBeVisible();
  expect(projects.getByRole('heading', { name: 'Understanding harmful language' })).toBeVisible();
  expect(projects.queryByRole('heading', { name: 'Agentic Shiksha' })).not.toBeInTheDocument();

  userEvent.click(filters.getByRole('button', { name: 'Perception' }));
  expect(projects.getByRole('heading', { name: 'Recovering language from history' })).toBeVisible();
  expect(projects.getByRole('heading', { name: 'Making sense of 3D spaces' })).toBeVisible();
  expect(projects.queryByRole('heading', { name: 'Few-shot concept erasure' })).not.toBeInTheDocument();

  userEvent.click(filters.getByRole('button', { name: 'All work' }));
  expect(projects.getByRole('heading', { name: 'Agentic Shiksha' })).toBeVisible();
  expect(projects.queryByRole('heading', { name: 'Few-shot concept erasure' })).not.toBeInTheDocument();
  userEvent.click(projects.getByRole('button', { name: /View all .* projects/ }));
  expect(projects.getByRole('heading', { name: 'Few-shot concept erasure' })).toBeVisible();
  expect(projects.getByRole('heading', { name: 'Understanding harmful language' })).toBeVisible();
  userEvent.click(projects.getByRole('button', { name: 'Show selected work' }));
  expect(projects.queryByRole('heading', { name: 'Few-shot concept erasure' })).not.toBeInTheDocument();
});

test('links The Curious Neuron to the top and keeps About out of navigation', () => {
  const { container } = render(<App />);
  const homeLink = within(screen.getByRole('banner')).getByRole('link', { name: 'The Curious Neuron' });
  const navigation = within(screen.getByRole('navigation', { name: 'Primary navigation' }));
  expect(homeLink).toHaveAttribute('href', '#home');
  expect(screen.queryByRole('link', { name: 'Welcome' })).not.toBeInTheDocument();
  expect(navigation.queryByRole('link', { name: 'About' })).not.toBeInTheDocument();
  expect(container.querySelector('#about')).toBeInTheDocument();

  userEvent.click(navigation.getByRole('link', { name: 'Research' }));
  expect(homeLink).not.toHaveAttribute('aria-current');
  const menu = screen.getByRole('button', { name: 'Open navigation' });
  userEvent.click(menu);
  expect(menu).toHaveAttribute('aria-expanded', 'true');
  userEvent.click(homeLink);
  expect(menu).toHaveAttribute('aria-expanded', 'false');
  expect(homeLink).toHaveAttribute('aria-current', 'location');
});

test('closes navigation with Escape and after following a section link', () => {
  render(<App />);
  const menu = screen.getByRole('button', { name: 'Open navigation' });
  userEvent.click(menu);
  expect(menu).toHaveAttribute('aria-expanded', 'true');

  fireEvent.keyDown(document, { key: 'Escape' });
  expect(menu).toHaveAttribute('aria-expanded', 'false');
  expect(menu).toHaveFocus();

  userEvent.click(menu);
  const navigation = within(screen.getByRole('navigation', { name: 'Primary navigation' }));
  userEvent.click(navigation.getByRole('link', { name: 'Research' }));
  expect(menu).toHaveAttribute('aria-expanded', 'false');
  expect(navigation.getByRole('link', { name: 'Research' })).toHaveAttribute('href', '#research');
});

test('research directions select the corresponding work category', () => {
  render(<App />);
  userEvent.click(screen.getByRole('link', { name: 'Explore Perception & embodied AI' }));
  const projects = within(screen.getByRole('region', { name: /From questions/ }));
  expect(projects.getByRole('button', { name: 'Perception' })).toHaveAttribute('aria-pressed', 'true');
  expect(projects.getByRole('heading', { name: 'Making sense of 3D spaces' })).toBeVisible();
  expect(projects.queryByRole('heading', { name: 'Agentic Shiksha' })).not.toBeInTheDocument();
});

test('opens a case study, verifies arithmetic, and closes without losing the work page', () => {
  render(<App />);
  const trigger = screen.getByRole('button', { name: 'Read about Learning to reason with GRPO' });
  userEvent.click(trigger);
  const dialog = screen.getByRole('dialog', { name: 'Learning to reason with GRPO' });
  expect(window.location.hash).toBe('#project-countdown');
  expect(within(dialog).getByRole('heading', { name: 'The approach' })).toBeVisible();
  userEvent.click(within(dialog).getByRole('button', { name: /Verify/ }));
  expect(within(dialog).getByRole('status')).toHaveTextContent('Verified! Result = 24');

  const input = within(dialog).getByRole('textbox', { name: 'Your expression' });
  userEvent.clear(input);
  userEvent.type(input, '7-3*6');
  userEvent.click(within(dialog).getByRole('button', { name: /Verify/ }));
  expect(within(dialog).getByRole('status')).toHaveTextContent('Result = -11');
  fireEvent.keyDown(dialog, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(window.location.hash).toBe('#projects');
  expect(trigger).toHaveFocus();
});

test('opens a case study directly from a shared project link', () => {
  window.history.replaceState(null, '', '#project-gujarati-ocr');
  render(<App />);
  expect(screen.getByRole('dialog', { name: 'Recovering language from history' })).toBeVisible();
});

test('explains an unknown project link instead of silently showing the wrong project', () => {
  window.history.replaceState(null, '', '#project-not-a-project');
  render(<App />);
  expect(screen.getByRole('alert')).toHaveTextContent('This project link is not available');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(window.location.hash).toBe('#projects');
});

test('copies a publication citation including its actual workshop and source URL', async () => {
  const writeText = jest.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  render(<Publications />);
  const paper = within(screen.getByRole('article', { name: /Overcoming Data Skew/ }));
  userEvent.click(paper.getByRole('button', { name: 'Copy citation' }));
  expect(await paper.findByText('Citation copied.')).toBeVisible();
  expect(writeText).toHaveBeenCalledWith(expect.stringContaining('IEEE INFOCOM 2025 Workshop'));
  expect(writeText).toHaveBeenCalledWith(expect.stringContaining('https://www.researchgate.net/publication/395643852_'));
});

describe('copying the contact email', () => {
  test('confirms a successful copy', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    render(<Contact />);
    userEvent.click(screen.getByRole('button', { name: 'Copy email address' }));

    expect(await screen.findByText('Email address copied.')).toBeVisible();
    expect(writeText).toHaveBeenCalledWith('swapnikvarala@gmail.com');
  });

  test.each(['unavailable', 'denied'])('shows a useful error when clipboard access is %s', async (state) => {
    const clipboard = state === 'unavailable' ? undefined : {
      writeText: jest.fn().mockRejectedValue(new Error('Clipboard permission denied')),
    };
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: clipboard });
    render(<Contact />);
    userEvent.click(screen.getByRole('button', { name: 'Copy email address' }));

    expect(await screen.findByText(/Could not copy. Please select and copy/)).toBeVisible();
    expect(screen.queryByText('Email address copied.')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'swapnikvarala@gmail.com' })).toHaveAttribute('href', 'mailto:swapnikvarala@gmail.com');
    expect(screen.getByRole('textbox', { name: 'Manual copy: Copy email address' })).toHaveValue('swapnikvarala@gmail.com');
  });
});
