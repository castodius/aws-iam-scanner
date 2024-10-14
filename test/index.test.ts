import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createQueue, deleteQueue, testPrincipal } from '../src/index.js'

describe('Integration tests', () => {
  const queueName = `aws-iam-scanner-${+new Date()}`

  let queueUrl: string
  let tester: ReturnType<typeof testPrincipal>

  beforeAll(async () => {
    queueUrl = await createQueue(queueName)
    tester = testPrincipal(queueUrl)
  })

  afterAll(async () => {
    await deleteQueue(queueUrl)
  })

  it('should return true if principal exists', async () => {
    // Taken from https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-api-with-vpclink-accounts.html
    const principals = [
      '392220576650',
      'arn:aws:iam::392220576650:root',
      '718770453195',
      'arn:aws:iam::718770453195:root',
    ]

    for (const principal of principals) {
      const output = await tester(principal)

      expect(output).toEqual(true)
    }
  })

  it('should return false if principal does not exist', async() => {
    const principals = [
      '111122223333',
      'arn:aws:iam::111122223333:root',
      '444455556666',
      'arn:aws:iam::444455556666:root',
    ]

    for (const principal of principals) {
      const output = await tester(principal)

      expect(output).toEqual(false)
    }
  })
})
