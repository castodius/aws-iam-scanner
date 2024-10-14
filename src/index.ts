import { CreateQueueCommand, DeleteQueueCommand, SetQueueAttributesCommand, SQSClient } from '@aws-sdk/client-sqs'

const client = new SQSClient({})

export const createQueue = async (queueName: string): Promise<string> => {
  return client.send(new CreateQueueCommand({
    QueueName: queueName
  }))
    .then(({ QueueUrl }) => QueueUrl!)
}

export const deleteQueue = async (queueUrl: string): Promise<void> => {
  await client.send(new DeleteQueueCommand({
    QueueUrl: queueUrl
  }))
}

export const testPrincipal = (queueUrl: string) => async (principal: string): Promise<boolean> => {
  try {
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
  } catch (err) {
    return false
  }
}
