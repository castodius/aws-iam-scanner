# Introduction

Proof-of-concept of checking whether an AWS Principal exists. You can check whether an Account, an IAM User or IAM Role exists **without having access to the Account in question**.

# Usage

Clone the repository. Install the dependencies

```zsh
yarn install --immutable
```

Make sure you have an active session with **any** AWS Account where you are allowed to create and delete SQS Queues. Run the supplied script. **Please note that the script will create and delete an SQS Queue.**

```zsh
yarn start --principals 111122223333 arn:aws:iam::444455556666:user/my-user arn:aws:iam::777788889999:role/cool-role
```

Review the output

```zsh
Principal '111122223333' does not exist
Principal 'arn:aws:iam::444455556666:user/my-user' exists
Principal 'arn:aws:iam::777788889999:role/cool-role' does not exist
```

If an Account is in the process of being closed the script will still report things as existing.

# How it works

When defining a Resource Policy such as an SQS Queue Policy you can specify an AWS Principal. Upon Policy creation/update AWS will validate if the AWS Principal exists or not. If it does not exist an error will be thrown, otherwise creation will proceed. This project abuses this fact.

I discovered this behavior while working on a Secrets Manager Secret Policy that was supposed to be accessed by a specific cross Account role. I reported the finding to AWS who replied everything was working as intended. To my knowledge there is no way for the owner of the targeted Account to know that someone has checked the presence of things in their account in this manner.

# Possible usage

There are questionable things you can do. If you get insights into an Organization's AWS Accounts once you can check the existence of those Accounts forever. Same with IAM Users and Roles.
