import { CreateQueueCommand, DeleteQueueCommand, SetQueueAttributesCommand, SQSClient } from '@aws-sdk/client-sqs'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

import { createQueue, deleteQueue, testPrincipal } from './index.js'

const client = new SQSClient({})

const { queueName, principals } = yargs(hideBin(process.argv))
  .options({
    queueName: {
      alias: 'q',
      default: 'aws-iam-scanner-queue',
      type: 'string'
    },
    principals: {
      alias: 'p',
      demandOption: true,
      type: 'array',
      string: true
    },
  })
  .usage('$0 --principals 111122223333 arn:aws:iam::444455556666:user/username@example.com')
  .help()
  .parseSync()

const main = async () => {
  const queueUrl = await createQueue(queueName)
  const tester = testPrincipal(queueUrl)

  for (const principal of principals) {
    const result = await tester(principal)
    if(result){
      console.log(`Principal '${principal}' exists`)
    } else {
      console.log(`Principal '${principal}' does not exist`)
    }
  }

  await deleteQueue(queueUrl)
}
main()
