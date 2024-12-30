"use client";

import CodeViewer from "@/components/code-viewer";
import { useScrollTo } from "@/hooks/use-scroll-to";
import { domain } from "@/utils/domain";
import { StreamHandler } from "@/utils/stream-handler";
import { CheckIcon } from "@heroicons/react/16/solid";
import { ArrowLongRightIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { ArrowUpOnSquareIcon } from "@heroicons/react/24/outline";
import * as Select from "@radix-ui/react-select";
import * as Switch from "@radix-ui/react-switch";
import * as Tooltip from "@radix-ui/react-tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import LoadingDots from "../../components/loading-dots";
import { shareApp } from "./actions";

export default function Home() {
  let [status, setStatus] = useState<
    "initial" | "creating" | "created" | "updating" | "updated"
  >("initial");
  let [prompt, setPrompt] = useState("");
  let providers = {
    together: {
      name: "Together AI",
      models: [
        {
          label: "Llama 3.1 405B",
          value: "together/meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo",
        },
        {
          label: "Llama 3.3 70B",
          value: "together/meta-llama/Llama-3.3-70B-Instruct-Turbo",
        },
        {
          label: "Qwen 2.5 Coder 32B",
          value: "together/Qwen/Qwen2.5-Coder-32B-Instruct",
        },
        {
          label: "Gemma 2 27B",
          value: "together/google/gemma-2-27b-it",
        },
      ],
    },
    openai: {
      name: "OpenAI",
      models: [
        {
          label: "GPT-4 Turbo",
          value: "openai/gpt-4-turbo",
        },
        {
          label: "GPT-3.5 Turbo",
          value: "openai/gpt-3.5-turbo",
        },
      ],
    },
    groq: {
      name: "Groq",
      models: [
        {
          label: "LLaMA2 70B",
          value: "groq/llama2-70b",
        },
        {
          label: "Mixtral 8x7B",
          value: "groq/mixtral-8x7b",
        },
        {
          label: "Gemma 7B",
          value: "groq/gemma-7b",
        },
      ],
    },
    mistral: {
      name: "Mistral AI",
      models: [
        {
          label: "Mistral Large",
          value: "mistral/mistral-large",
        },
        {
          label: "Mistral Medium",
          value: "mistral/mistral-medium",
        },
        {
          label: "Mistral Small",
          value: "mistral/mistral-small",
        },
        {
          label: "Mistral Tiny",
          value: "mistral/mistral-tiny",
        },
      ],
    },
    ai21: {
      name: "AI21",
      models: [
        {
          label: "Jurassic-2 Ultra",
          value: "ai21/j2-ultra",
        },
        {
          label: "Jurassic-2 Mid",
          value: "ai21/j2-mid",
        },
        {
          label: "Jurassic-2 Light",
          value: "ai21/j2-light",
        },
      ],
    },
    gemini: {
      name: "Google Gemini",
      models: [
        {
          label: "Gemini Pro",
          value: "gemini/gemini-pro",
        },
        {
          label: "Gemini Ultra",
          value: "gemini/gemini-ultra",
        },
        {
          label: "Gemini Pro Vision",
          value: "gemini/gemini-pro-vision",
        },
      ],
    },
    cohere: {
      name: "Cohere",
      models: [
        {
          label: "Command",
          value: "cohere/command",
        },
        {
          label: "Command Light",
          value: "cohere/command-light",
        },
        {
          label: "Command R",
          value: "cohere/command-r",
        },
        {
          label: "Command R Light",
          value: "cohere/command-r-light",
        },
      ],
    },
    openrouter: {
      name: "OpenRouter",
      models: [
        {
          label: "GPT-4",
          value: "openrouter/gpt-4",
        },
        {
          label: "GPT-3.5 Turbo",
          value: "openrouter/gpt-3.5-turbo",
        },
        {
          label: "Claude 2",
          value: "openrouter/claude-2",
        },
        {
          label: "Claude Instant",
          value: "openrouter/claude-instant",
        },
        {
          label: "LLaMA 2 70B",
          value: "openrouter/llama-2-70b",
        },
      ],
    },
    fireworks: {
      name: "Fireworks",
      models: [
        {
          label: "LLaMA v2 70B",
          value: "fireworks/llama-v2-70b",
        },
        {
          label: "LLaMA v2 13B",
          value: "fireworks/llama-v2-13b",
        },
        {
          label: "Mixtral 8x7B",
          value: "fireworks/mixtral-8x7b",
        },
        {
          label: "Mistral 7B",
          value: "fireworks/mistral-7b",
        },
        {
          label: "Qwen 72B",
          value: "fireworks/qwen-72b",
        },
      ],
    },
    glhf: {
      name: "GLHF",
      models: [
        {
          label: "Mistral 7B",
          value: "glhf/mistral-7b",
        },
        {
          label: "LLaMA 2 70B",
          value: "glhf/llama-2-70b",
        },
        {
          label: "LLaMA 2 13B",
          value: "glhf/llama-2-13b",
        },
        {
          label: "CodeLlama 34B",
          value: "glhf/codellama-34b",
        },
        {
          label: "Mixtral 8x7B",
          value: "glhf/mixtral-8x7b",
        },
      ],
    },
    sambanova: {
      name: "SambaNova",
      models: [
        {
          label: "SambaNova 1",
          value: "sambanova/sambanova-1",
        },
        {
          label: "SambaNova 2",
          value: "sambanova/sambanova-2",
        },
        {
          label: "SambaNova 3",
          value: "sambanova/sambanova-3",
        },
      ],
    },
    upstage: {
      name: "Upstage",
      models: [
        {
          label: "Solar 0 70B",
          value: "upstage/solar-0-70b",
        },
        {
          label: "Starling LM 7B",
          value: "upstage/starling-lm-7b",
        },
        {
          label: "Nous Hermes LLaMA2 70B",
          value: "upstage/nous-hermes-llama2-70b",
        },
        {
          label: "Platypus2 70B",
          value: "upstage/platypus2-70b",
        },
        {
          label: "Starling LM Alpha",
          value: "upstage/starling-lm-alpha",
        },
      ],
    },
    edenai: {
      name: "EdenAI",
      models: [
        {
          label: "GPT-4",
          value: "edenai/gpt-4",
        },
        {
          label: "GPT-3.5 Turbo",
          value: "edenai/gpt-3.5-turbo",
        },
        {
          label: "Claude 2",
          value: "edenai/claude-2",
        },
        {
          label: "Command",
          value: "edenai/command",
        },
        {
          label: "PaLM 2",
          value: "edenai/palm-2",
        },
      ],
    },
    cerebrium: {
      name: "Cerebrium",
      models: [
        {
          label: "LLaMA 2 70B",
          value: "cerebrium/llama-2-70b",
        },
        {
          label: "LLaMA 2 13B",
          value: "cerebrium/llama-2-13b",
        },
        {
          label: "LLaMA 2 7B",
          value: "cerebrium/llama-2-7b",
        },
        {
          label: "CodeLlama 34B",
          value: "cerebrium/codellama-34b",
        },
        {
          label: "Mixtral 8x7B",
          value: "cerebrium/mixtral-8x7b",
        },
      ],
    },
    deepseek: {
      name: "Deepseek",
      models: [
        {
          label: "Deepseek Coder 33B",
          value: "deepseek/deepseek-coder-33b",
        },
        {
          label: "Deepseek Coder 6.7B",
          value: "deepseek/deepseek-coder-6.7b",
        },
        {
          label: "Deepseek Chat 67B",
          value: "deepseek/deepseek-chat-67b",
        },
        {
          label: "Deepseek Chat 7B",
          value: "deepseek/deepseek-chat-7b",
        },
      ],
    },
    hyperbolic: {
      name: "Hyperbolic",
      models: [
        {
          label: "Mixtral 8x7B",
          value: "hyperbolic/mixtral-8x7b",
        },
        {
          label: "Mistral 7B",
          value: "hyperbolic/mistral-7b",
        },
        {
          label: "LLaMA 2 70B",
          value: "hyperbolic/llama-2-70b",
        },
        {
          label: "LLaMA 2 13B",
          value: "hyperbolic/llama-2-13b",
        },
        {
          label: "CodeLlama 34B",
          value: "hyperbolic/codellama-34b",
        },
      ],
    },
  };

  let [selectedProvider, setSelectedProvider] = useState<keyof typeof providers>("together");
  let [model, setModel] = useState(providers.together.models[0].value);
  let [shadcn, setShadcn] = useState(false);
  let [modification, setModification] = useState("");
  let [generatedCode, setGeneratedCode] = useState("");
  let [initialAppConfig, setInitialAppConfig] = useState({
    model: "",
    shadcn: true,
  });
  let [ref, scrollTo] = useScrollTo();
  let [messages, setMessages] = useState<{ role: string; content: string }[]>(
    [],
  );
  let [isPublishing, setIsPublishing] = useState(false);

  let loading = status === "creating" || status === "updating";

  async function createApp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (status !== "initial") {
      scrollTo({ delay: 0.5 });
    }

    try {
      setStatus("creating");
      setGeneratedCode("");

      let res = await fetch("/api/generateCode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          shadcn,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || res.statusText);
      }

      if (!res.body) {
        throw new Error("No response body");
      }

      const streamHandler = new StreamHandler(
        (delta) => {
          // Remove any markdown code block indicators
          const cleanDelta = delta.replace(/^```[\w]*\n?|\n?```$/g, '');
          setGeneratedCode((prev) => prev + cleanDelta);
        },
        () => {
          setMessages([{ role: "user", content: prompt }]);
          setInitialAppConfig({ model, shadcn });
          setStatus("created");
        }
      );

      await streamHandler.handleStream(res);
    } catch (error: any) {
      console.error('Error generating code:', error);
      toast.error(error.message || 'Failed to generate code');
      setStatus("initial");
    }
  }

  async function updateApp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setStatus("updating");

      let codeMessage = { role: "assistant", content: generatedCode };
      let modificationMessage = { role: "user", content: modification };

      setGeneratedCode("");

      const res = await fetch("/api/generateCode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, codeMessage, modificationMessage],
          model: initialAppConfig.model,
          shadcn: initialAppConfig.shadcn,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || res.statusText);
      }

      if (!res.body) {
        throw new Error("No response body");
      }

      const streamHandler = new StreamHandler(
        (delta) => {
          // Remove any markdown code block indicators
          const cleanDelta = delta.replace(/^```[\w]*\n?|\n?```$/g, '');
          setGeneratedCode((prev) => prev + cleanDelta);
        },
        () => {
          setMessages((m) => [...m, codeMessage, modificationMessage]);
          setStatus("updated");
        }
      );

      await streamHandler.handleStream(res);
    } catch (error: any) {
      console.error('Error updating code:', error);
      toast.error(error.message || 'Failed to update code');
      setStatus("created");
    }
  }

  useEffect(() => {
    let el = document.querySelector(".cm-scroller");
    if (el && loading) {
      let end = el.scrollHeight - el.clientHeight;
      el.scrollTo({ top: end });
    }
  }, [loading, generatedCode]);

  return (
    <main className="mt-12 flex w-full flex-1 flex-col items-center px-4 text-center sm:mt-20">
      <a
        className="mb-4 inline-flex h-7 shrink-0 items-center gap-[9px] rounded-[50px] border-[0.5px] border-solid border-[#E6E6E6] bg-[rgba(234,238,255,0.65)] bg-gray-100 px-7 py-5 shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25)]"
        href="https://dub.sh/together-ai/?utm_source=example-app&utm_medium=llamacoder&utm_campaign=llamacoder-app-signup"
        target="_blank"
      >
        <span className="text-center">
          Powered by <span className="font-medium">Llama 3.1</span> and{" "}
          <span className="font-medium">Together AI</span>
        </span>
      </a>
      <h1 className="my-6 max-w-3xl text-4xl font-bold text-gray-800 sm:text-6xl">
        Turn your <span className="text-blue-600">idea</span>
        <br /> into an <span className="text-blue-600">app</span>
      </h1>

      <form className="w-full max-w-xl" onSubmit={createApp}>
        <fieldset disabled={loading} className="disabled:opacity-75">
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
              <Select.Root
                value={selectedProvider}
                onValueChange={(value: keyof typeof providers) => {
                  setSelectedProvider(value);
                  setModel(providers[value].models[0].value);
                }}
              >
                <Select.Trigger className="w-full inline-flex items-center justify-between rounded-2xl border-[6px] border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-green-500" />
                    <Select.Value>
                      {providers[selectedProvider].name}
                    </Select.Value>
                  </div>
                  <Select.Icon>
                    <ChevronDownIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg ring-1 ring-black ring-opacity-5 animate-in fade-in-80">
                    <Select.ScrollUpButton className="flex items-center justify-center h-[25px] bg-white text-gray-500 cursor-default">
                      <ChevronDownIcon className="h-4 w-4 rotate-180" />
                    </Select.ScrollUpButton>
                    <Select.Viewport className="p-2">
                      {Object.entries(providers).map(([key, provider]) => (
                        <Select.Item
                          key={key}
                          value={key}
                          className="relative flex w-full cursor-pointer select-none items-center rounded-lg py-2.5 pl-10 pr-4 text-sm text-gray-900 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                        >
                          <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-green-500" />
                            <Select.ItemText>{provider.name}</Select.ItemText>
                          </div>
                          <Select.ItemIndicator className="absolute left-3 inline-flex items-center justify-center">
                            <CheckIcon className="h-4 w-4 text-blue-600" />
                          </Select.ItemIndicator>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                    <Select.ScrollDownButton className="flex items-center justify-center h-[25px] bg-white text-gray-500 cursor-default">
                      <ChevronDownIcon className="h-4 w-4" />
                    </Select.ScrollDownButton>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
              <Select.Root value={model} onValueChange={setModel}>
                <Select.Trigger className="w-full inline-flex items-center justify-between rounded-2xl border-[6px] border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-blue-500" />
                    <Select.Value>
                      {providers[selectedProvider].models.find(m => m.value === model)?.label || model}
                    </Select.Value>
                  </div>
                  <Select.Icon>
                    <ChevronDownIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg ring-1 ring-black ring-opacity-5 animate-in fade-in-80">
                    <Select.ScrollUpButton className="flex items-center justify-center h-[25px] bg-white text-gray-500 cursor-default">
                      <ChevronDownIcon className="h-4 w-4 rotate-180" />
                    </Select.ScrollUpButton>
                    <Select.Viewport className="p-2">
                      {providers[selectedProvider].models.map((model) => (
                        <Select.Item
                          key={model.value}
                          value={model.value}
                          className="relative flex w-full cursor-pointer select-none items-center rounded-lg py-2.5 pl-10 pr-4 text-sm text-gray-900 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                        >
                          <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-blue-500" />
                            <Select.ItemText>{model.label}</Select.ItemText>
                          </div>
                          <Select.ItemIndicator className="absolute left-3 inline-flex items-center justify-center">
                            <CheckIcon className="h-4 w-4 text-blue-600" />
                          </Select.ItemIndicator>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                    <Select.ScrollDownButton className="flex items-center justify-center h-[25px] bg-white text-gray-500 cursor-default">
                      <ChevronDownIcon className="h-4 w-4" />
                    </Select.ScrollDownButton>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>
          </div>

          <div className="relative mt-5">
            <div className="absolute -inset-2 rounded-[32px] bg-gray-300/50" />
            <div className="relative flex rounded-3xl bg-white shadow-sm group-disabled:bg-gray-50">
              <div className="relative flex flex-grow items-stretch focus-within:z-10">
                <textarea
                  rows={3}
                  required
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  name="prompt"
                  className="w-full resize-none rounded-l-3xl bg-transparent px-6 py-5 text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed"
                  placeholder="Build me a calculator app..."
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-3xl px-3 py-2 text-sm font-semibold text-blue-500 hover:text-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 disabled:text-gray-900"
              >
                {status === "creating" ? (
                  <LoadingDots color="black" style="large" />
                ) : (
                  <ArrowLongRightIcon className="-ml-0.5 size-6" />
                )}
              </button>
            </div>
          </div>
          <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row sm:items-center sm:gap-8">
            <div className="flex items-center justify-between gap-3 sm:justify-center">
              <p className="text-gray-500 sm:text-xs">shadcn/ui:</p>
              <Switch.Root
                className="group flex w-20 max-w-xs items-center rounded-2xl border-[6px] border-gray-300 bg-white p-1.5 text-sm shadow-inner transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 data-[state=checked]:bg-blue-500"
                id="shadcn"
                name="shadcn"
                checked={shadcn}
                onCheckedChange={(value) => setShadcn(value)}
              >
                <Switch.Thumb className="size-7 rounded-lg bg-gray-200 shadow-[0_1px_2px] shadow-gray-400 transition data-[state=checked]:translate-x-7 data-[state=checked]:bg-white data-[state=checked]:shadow-gray-600" />
              </Switch.Root>
            </div>
          </div>
        </fieldset>
      </form>

      <hr className="border-1 mb-20 h-px bg-gray-700 dark:bg-gray-700" />

      {status !== "initial" && (
        <motion.div
          initial={{ height: 0 }}
          animate={{
            height: "auto",
            overflow: "hidden",
            transitionEnd: { overflow: "visible" },
          }}
          transition={{ type: "spring", bounce: 0, duration: 0.5 }}
          className="w-full pb-[25vh] pt-10"
          onAnimationComplete={() => scrollTo()}
          ref={ref}
        >
          <div className="mt-5 flex gap-4">
            <form className="w-full" onSubmit={updateApp}>
              <fieldset disabled={loading} className="group">
                <div className="relative">
                  <div className="relative flex rounded-3xl bg-white shadow-sm group-disabled:bg-gray-50">
                    <div className="relative flex flex-grow items-stretch focus-within:z-10">
                      <input
                        required
                        name="modification"
                        value={modification}
                        onChange={(e) => setModification(e.target.value)}
                        className="w-full rounded-l-3xl bg-transparent px-6 py-5 text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed"
                        placeholder="Make changes to your app here"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-3xl px-3 py-2 text-sm font-semibold text-blue-500 hover:text-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 disabled:text-gray-900"
                    >
                      {loading ? (
                        <LoadingDots color="black" style="large" />
                      ) : (
                        <ArrowLongRightIcon className="-ml-0.5 size-6" />
                      )}
                    </button>
                  </div>
                </div>
              </fieldset>
            </form>
            <div>
              <Toaster invert={true} />
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      disabled={loading || isPublishing}
                      onClick={async () => {
                        setIsPublishing(true);
                        let userMessages = messages.filter(
                          (message) => message.role === "user",
                        );
                        let prompt =
                          userMessages[userMessages.length - 1].content;

                        const appId = await minDelay(
                          shareApp({
                            generatedCode,
                            prompt,
                            model: initialAppConfig.model,
                          }),
                          1000,
                        );
                        setIsPublishing(false);
                        toast.success(
                          `Your app has been published & copied to your clipboard! llamacoder.io/share/${appId}`,
                        );
                        navigator.clipboard.writeText(
                          `${domain}/share/${appId}`,
                        );
                      }}
                      className="inline-flex h-[68px] w-40 items-center justify-center gap-2 rounded-3xl bg-blue-500 transition enabled:hover:bg-blue-600 disabled:grayscale"
                    >
                      <span className="relative">
                        {isPublishing && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <LoadingDots color="white" style="large" />
                          </span>
                        )}

                        <ArrowUpOnSquareIcon
                          className={`${isPublishing ? "invisible" : ""} size-5 text-xl text-white`}
                        />
                      </span>

                      <p className="text-lg font-medium text-white">
                        Publish app
                      </p>
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="select-none rounded bg-white px-4 py-2.5 text-sm leading-none shadow-md shadow-black/20"
                      sideOffset={5}
                    >
                      Publish your app to the internet.
                      <Tooltip.Arrow className="fill-white" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
            </div>
          </div>
          <div className="relative mt-8 w-full overflow-hidden">
            <div className="isolate">
              <CodeViewer code={generatedCode} showEditor />
            </div>

            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={status === "updating" ? { x: "100%" } : undefined}
                  animate={status === "updating" ? { x: "0%" } : undefined}
                  exit={{ x: "100%" }}
                  transition={{
                    type: "spring",
                    bounce: 0,
                    duration: 0.85,
                    delay: 0.5,
                  }}
                  className="absolute inset-x-0 bottom-0 top-1/2 flex items-center justify-center rounded-r border border-gray-400 bg-gradient-to-br from-gray-100 to-gray-300 md:inset-y-0 md:left-1/2 md:right-0"
                >
                  <p className="animate-pulse text-3xl font-bold">
                    {status === "creating"
                      ? "Building your app..."
                      : "Updating your app..."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </main>
  );
}

async function minDelay<T>(promise: Promise<T>, ms: number) {
  let delay = new Promise((resolve) => setTimeout(resolve, ms));
  let [p] = await Promise.all([promise, delay]);

  return p;
}
