"use client";

import { Card, Divider, Subtitle, Text } from "@tremor/react";

export default function Home() {
  return (
    <main className=" min-h-screen bg-gradient-to-br from-[#bd5656] to-[#e47070]  p-10 flex flex-col  justify-center items-center">
      <Card>
        <Text className=" text-6xl font-bold text-center mb-10">
          Weather AI
        </Text>
        <Subtitle className=" text-xl text-center">
          power by nextjs13, openAI, tailwind CSS, tremor 2.0 +more!
        </Subtitle>
        <Divider className="my-10" />
        <Card className=" bg-gradient-to-br from-[#bd5656] to-[#e47070]"></Card>
      </Card>
    </main>
  );
}
