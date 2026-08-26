# SmsAI

AI-powered SMS messaging platform: the backend.

Messages are drafted with LLMs and delivered as SMS campaigns over
[NetGSM](https://www.netgsm.com.tr), with payments handled by PayTR and
Iyzico. Deployed at [api.smsai.site](https://api.smsai.site) behind the
dashboard at [smsai.site](https://www.smsai.site).

## Stack

- Express + TypeScript
- PostgreSQL via Sequelize
- Kafka (kafkajs) job queue, node-cron schedules
- AI providers: OpenAI, Google Gemini, DeepSeek
- SMS delivery: NetGSM
- Payments: PayTR, Iyzico
- AWS CloudWatch logging

## Run

```sh
docker compose up
```

All third-party credentials are provided through environment variables;
see the `environment` block in `docker-compose.yml` for the full list.

> Historical commits contained hardcoded credentials. They were scrubbed
> from the entire git history before this repository was made public.
> All keys involved were rotated.

Frontend: [SmsAI-Frontend](https://github.com/satas20/SmsAI-Frontend)
