import { describe, test, expect } from 'vitest'
import { normalizePost, normalizePostsArray } from './normalizePost'

describe('normalizePost', () => {
  test('возвращает объект с обязательными полями', () => {
    const result = normalizePost({})

    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('content')
    expect(result).toHaveProperty('likes')
    expect(result).toHaveProperty('timestamp')
    expect(result).toHaveProperty('liked_by_user')
  })

  test('обрабатывает undefined', () => {
    const result = normalizePost()
    expect(result.content).toBe('')
    expect(result.likes).toBe(0)
  })

  test('сохраняет дополнительные поля', () => {
    const post: Record<string, unknown> = {
      id: 123,
      content: 'Пост',
      author: { name: 'Автор' },
      custom_field: 'значение',
    }

    const result = normalizePost(post)

    expect(result.id).toBe(123)
    expect(result.content).toBe('Пост')
    expect(result).toMatchObject({ author: { name: 'Автор' }, custom_field: 'значение' })
  })
})

describe('normalizePostsArray', () => {
  test('обрабатывает пустой массив', () => {
    const result = normalizePostsArray([])
    expect(Array.isArray(result)).toBe(true)
    expect(result).toHaveLength(0)
  })
})
