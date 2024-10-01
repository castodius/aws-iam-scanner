import { CreateQueueCommand, DeleteQueueCommand, SetQueueAttributesCommand, SQSClient } from '@aws-sdk/client-sqs'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

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
    }
  })
  .usage('$0 --principals 111122223333 arn:aws:iam::444455556666:user/username@example.com')
  .help()
  .parseSync()

const createQueue = async (): Promise<string> => {
  return client.send(new CreateQueueCommand({
    QueueName: queueName
  }))
    .then(({ QueueUrl }) => QueueUrl!)
}

const deleteQueue = async (queueUrl: string): Promise<void> => {
  await client.send(new DeleteQueueCommand({
    QueueUrl: queueUrl
  }))
}

const testPrincipal = (queueUrl: string) => async (principal: string): Promise<boolean> => {
  try{
    await client.send(new SetQueueAttributesCommand({
      QueueUrl: queueUrl,
      Attributes: {
        Policy: JSON.stringify({
          Version: '2012-10-17',
          Id: 'Queue1_Policy_UUID',
          Statement: [{
            Sid: 'Queue1_SendMessage',
            Effect: 'Allow',
            Principal: {
              AWS: principal
            },
            Action: 'sqs:SendMessage',
            Resource: '*'
          }]
        })
      }
    }))
    return true
  }catch(err){
    return false
  }
}

const main = async () => {
  const queueUrl = await createQueue()
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
