import { render } from '@testing-library/react'
import { AchievementBadge } from '@/components/ui/achievement-badge'

test('renderiza un svg para cada kind', () => {
  const { container, rerender } = render(<AchievementBadge kind="star" />)
  expect(container.querySelector('svg')).toBeTruthy()
  rerender(<AchievementBadge kind="shield" />)
  expect(container.querySelector('svg')).toBeTruthy()
  rerender(<AchievementBadge kind="gem" locked />)
  expect(container.querySelector('svg')).toBeTruthy()
})
