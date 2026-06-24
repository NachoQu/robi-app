import { render } from '@testing-library/react'
import { AchievementBadge } from '@/components/ui/achievement-badge'

test('renderiza una imagen para cada badge', () => {
  const { container, rerender } = render(<AchievementBadge imageSrc="/badge-icon-1.png" />)
  expect(container.querySelector('img')).toBeTruthy()
  rerender(<AchievementBadge imageSrc="/badge-icon-2.png" />)
  expect(container.querySelector('img')).toBeTruthy()
  rerender(<AchievementBadge imageSrc="/badge-icon-3.png" locked />)
  expect(container.querySelector('img')).toBeTruthy()
})
