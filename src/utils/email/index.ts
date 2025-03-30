import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const client = new SESClient({
  region: "ap-northeast-2"
});

export async function sendEmail(destination: string, title: string, content: string, source: string) {
  const params = {
    Destination: {
      ToAddresses: [destination],
    },
    Message: {
      Body: {
        Text: {
          Data: content,
        },
      },
      Subject: {
        Data: title,
      },
    },
    Source: source,
  };
  try {
    const command = new SendEmailCommand(params);
    const response = await client.send(command);
    console.log("이메일 전송 성공:", response.MessageId);
  } catch (err) {
    console.error("이메일 전송 실패:", err);
  }
}
