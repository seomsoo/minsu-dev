'use client';

import { useState } from 'react';

const steps = [
  {
    desc: "동기 코드부터 실행한다. console.log('1')이 콜스택에 올라가고 바로 실행된다.",
    cs: ["console.log('1')"],
    mq: [],
    tq: [],
    out: ['1'],
  },
  {
    desc: 'setTimeout은 비동기다. 콜백을 Web API에 맡기고, 0ms 후 태스크 큐에 넣어둔다.',
    cs: [],
    mq: [],
    tq: ['setTimeout 콜백'],
    out: ['1'],
  },
  {
    desc: 'Promise.then()의 콜백은 마이크로태스크 큐에 들어간다. 태스크 큐보다 우선순위가 높다.',
    cs: [],
    mq: ['Promise.then 콜백'],
    tq: ['setTimeout 콜백'],
    out: ['1'],
  },
  {
    desc: 'queueMicrotask()도 마이크로태스크 큐에 들어간다. Promise.then 뒤에 줄을 선다.',
    cs: [],
    mq: ['Promise.then 콜백', 'queueMicrotask 콜백'],
    tq: ['setTimeout 콜백'],
    out: ['1'],
  },
  {
    desc: "console.log('5')도 동기 코드이므로 바로 실행된다. 이제 동기 코드가 전부 끝났다.",
    cs: ["console.log('5')"],
    mq: ['Promise.then 콜백', 'queueMicrotask 콜백'],
    tq: ['setTimeout 콜백'],
    out: ['1', '5'],
  },
  {
    desc: '콜스택이 비었다. 이벤트 루프가 마이크로태스크 큐를 먼저 확인하고, Promise.then 콜백을 실행한다.',
    cs: ['Promise.then 콜백'],
    mq: ['queueMicrotask 콜백'],
    tq: ['setTimeout 콜백'],
    out: ['1', '5', '3'],
  },
  {
    desc: '마이크로태스크 큐가 빌 때까지 전부 처리한다. queueMicrotask 콜백도 실행한다.',
    cs: ['queueMicrotask 콜백'],
    mq: [],
    tq: ['setTimeout 콜백'],
    out: ['1', '5', '3', '4'],
  },
  {
    desc: '마이크로태스크 큐가 비었으니, 이제서야 태스크 큐의 setTimeout 콜백을 실행한다.',
    cs: ['setTimeout 콜백'],
    mq: [],
    tq: [],
    out: ['1', '5', '3', '4', '2'],
  },
  {
    desc: '모든 큐가 비었다. 최종 출력 순서: 1 → 5 → 3 → 4 → 2',
    cs: [],
    mq: [],
    tq: [],
    out: ['1', '5', '3', '4', '2'],
  },
];

export const EventLoopStepper = () => {
  const [cur, setCur] = useState(0);
  const step = steps[cur];
  const isFirst = cur === 0;
  const isLast = cur === steps.length - 1;

  const go = (dir: number) => {
    setCur((prev) => Math.max(0, Math.min(steps.length - 1, prev + dir)));
  };

  return (
    <div className="not-prose my-8 font-mono select-none">
      <div className="grid grid-cols-3 gap-3">
        <Queue label="call stack" items={step.cs} />
        <Queue label="microtask" items={step.mq} />
        <Queue label="task" items={step.tq} />
      </div>

      <div className="border-border mt-3 rounded border px-3 py-2">
        <span className="text-text-secondary mr-2 text-xs">{'>'}</span>
        <span className="text-text-primary text-sm">
          {step.out.length > 0 ? step.out.join('  ') : '\u00A0'}
        </span>
      </div>

      <div className="border-border mt-4 border-l-2 py-1 pl-4 text-sm leading-relaxed">
        <span className="text-text-secondary mr-2 text-xs">
          {cur + 1}/{steps.length}
        </span>
        <span className="text-text-primary">{step.desc}</span>
      </div>

      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          onClick={() => go(-1)}
          disabled={isFirst}
          className="text-text-secondary hover:text-text-primary cursor-pointer text-xs transition-colors disabled:cursor-default disabled:opacity-20"
        >
          ← prev
        </button>

        <div className="flex gap-1">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCur(i)}
              className={`h-1.5 cursor-pointer rounded-full transition-all ${
                i === cur
                  ? 'bg-text-primary w-4'
                  : 'bg-border hover:bg-text-secondary/40 w-1.5'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => go(1)}
          disabled={isLast}
          className="text-text-secondary hover:text-text-primary cursor-pointer text-xs transition-colors disabled:cursor-default disabled:opacity-20"
        >
          next →
        </button>
      </div>
    </div>
  );
};

const Queue = ({ label, items }: { label: string; items: string[] }) => (
  <div className="border-border h-32 rounded border p-2.5">
    <p className="text-text-secondary mb-2 text-[10px] tracking-wider uppercase">
      {label}
    </p>
    {items.length > 0 ? (
      items.map((item, i) => (
        <div
          key={i}
          className="border-border text-text-primary mb-1 rounded border px-2 py-1 text-[11px]"
        >
          {item}
        </div>
      ))
    ) : (
      <span className="text-text-secondary/30 text-[11px]">empty</span>
    )}
  </div>
);
