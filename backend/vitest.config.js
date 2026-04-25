// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    env: {
      NODE_ENV: 'test',
      MONGO_URI: 'mongodb://localhost:27017/test_db' 
    },
  },
})
