![image](https://user-images.githubusercontent.com/22762150/172976873-90907210-9450-4699-adcf-d23daa5ea866.png)

WhaleHouse is a firendly user interface that lets you search,explore and visualize your ClickHouse Data.

We provides the following features,you can access http://8.135.49.240:8080 to try directly without any installing.

# Features

- An online SQL editor which can run your SQL code without any installing.
  <img src="https://user-images.githubusercontent.com/22762150/184086489-20d872a9-32b6-4773-a86f-f17e5775467f.png" width="500"/>

- You can observe all processes and mutations. For those unfinished processes, you can kill them in ui.
  <img src="https://user-images.githubusercontent.com/22762150/184086629-3d848426-b463-430f-a738-609c0eff2800.png" width="500"/>

- The Metrics contains Cluster Analysis,Data Analysis,Query Analysis.
  <img src="https://user-images.githubusercontent.com/22762150/184086690-4fb86363-316c-48ac-a73f-d486c1caf56b.png" width="500"/>

- Time-series Prediction use time series modeling to detect anomalies in your current data and forecast trends based on historical data in Clickhouse.
  <img src="https://user-images.githubusercontent.com/22762150/172766700-de6b755c-0f9d-47e3-b0e3-fbb72ca06f23.png" width="500" />

- A Graph Analysis feature enable you to model,explore,visualize connected data hided in Clickhouse.
  <img src="https://user-images.githubusercontent.com/22762150/172766866-338525eb-b75a-43e4-96fb-c266b81c7457.png" width="500"/>

# Install

```bash
npm install -g pnpm
pnpm install
pnpm dev
```

# Support

You are free to open an [issue](https://github.com/clickcat-project/WhaleHouse/issues) if you have any question or idea.

# Contribute

At present, the WhaleHouse project is mainly composed of a front-end project(Vue3 + TypeScript) + a Python project (time series prediction model).
We are always open to people who want to use the system or contribute to it. Contact us if you are looking for implementation tasks that fit your skills.

# Deploy

```bash
pnpm build:updateVersion x.x.x
```
