const EventEmitter = require("events");
const fs = require("fs");

const Mailjet = require("node-mailjet");
const mailjet = new Mailjet({
  apiKey: "324c932ecc96af248181b4a54746df2d",
  apiSecret: "a0f8d82df767b2f26132a5bf32a66f20",
});

const eventEmitter = new EventEmitter();
let date, averageTemp;

// task 1 and 3
eventEmitter.on("tempData", (date, temperature) => {
  const data = { date, temperature };
  const jsonData = JSON.stringify(data);
  fs.appendFileSync("temperature.json", jsonData + "\n");
  console.log("Data is recorded");

  if (temperature > 30) {
    eventEmitter.emit("tempAlert", date, temperature);
  }
});
eventEmitter.on("tempAlert", (date, temperature) => {
  console.log(
    `temperature above 30 degrees on ${date}: ${temperature} degrees`
  );
});

eventEmitter.emit("tempData", "24-04-2023", 15);
eventEmitter.emit("tempData", "24-04-2023", 10);
eventEmitter.emit("tempData", "25-04-2023", 28);
eventEmitter.emit("tempData", "25-04-2023", 32);

// task 2
eventEmitter.on("averageTemp", (date) => {
  fs.readFile("temperature.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    const temperatures = data
      .split("\n")
      .filter((line) => line)
      .map((line) => JSON.parse(line))
      .filter((data) => data.date === date)
      .map((data) => data.temperature);

    if (temperatures.length === 0) {
      console.log(`no data for date ${date} `);
      return;
    }
    const averageTemp =
      temperatures.reduce((acc, temperature) => acc + temperature, 0) /
      temperatures.length;

    console.log(`the average temperature on ${date} was ${averageTemp}`);
  });
});

eventEmitter.emit("averageTemp", "24-04-2023");

// task *
const request = mailjet.post("send", { version: "v3.1" }).request({
  Messages: [
    {
      From: {
        Email: "temperaturedata@gmail.com",
        Name: "-",
      },
      To: [
        {
          Email: "darvaiolesia@gmail.com",
          Name: "-",
        },
      ],
      Subject: `Average air temperature for ${date}`,
      TextPart: `Average air temperature for ${date}: ${averageTemp}`,
    },
  ],
});

request
  .then((result) => {
    console.log("results have been successfully sent to e-mail");
  })
  .catch((err) => {
    console.log(err.statusCode);
  });
