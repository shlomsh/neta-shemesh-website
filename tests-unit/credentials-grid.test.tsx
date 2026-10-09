import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { CredentialsList } from '../src/components/sections/credentials/CredentialsList';

test('CredentialsList uses a grid layout with 3 columns on desktop', () => {
  const dummyItems = [{ text: 'Test 1' }, { text: 'Test 2' }];
  const { container } = render(<CredentialsList items={dummyItems} checkIconSrc="/test-icon.png" />);

  // Find the list element (ul)
  const list = screen.getByRole('list');
  
  // Verify grid classes are present
  expect(list.className).toContain('grid');
  expect(list.className).toContain('grid-cols-2');
  expect(list.className).toContain('md:grid-cols-3');

  // Verify list item (li) flex-col classes
  const listItems = screen.getAllByRole('listitem');
  expect(listItems[0].className).toContain('flex-col');
  expect(listItems[0].className).toContain('items-center');
  
  // Verify icon classes
  const icon = container.querySelector('img');
  expect(icon?.className).toContain('mb-[16px]');
  expect(icon?.className).toContain('w-[96px]');
  expect(icon?.className).toContain('h-auto');
});
