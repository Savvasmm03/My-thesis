import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";


const PageLayout = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  background-color: #1e1e1e;
  color: white;
  padding: 20px;
  overflow-x: hidden;
  overflow-y: auto; 
`;



const TopPanelWrapper = styled.div`
  display: flex;
  width: 100%;
  gap: 15px;
`;

const ModelList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ModelOption = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 8px;
  background-color: ${({ selected }) => (selected ? "#2d2d2d" : "#1a1a1a")};
  border: 1px solid ${({ selected }) => (selected ? "#00bfff" : "#333")};
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background-color: #2a2a2a;
    transform: translateY(-2px);
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  }

  img {
    width: 24px;
    height: 24px;
  }

  span {
    font-size: 15px;
  }
`;

const Panel = styled.div`
  padding: 20px;
  box-sizing: border-box;
  border: 1px solid #333;
  background-color: #121212;
  border-radius: 8px;
  height: 580px; 
  overflow-y: auto; 

  h3 {
    color: #00bfff;
    margin-bottom: 15px;
  }
`;


const Panel25 = styled(Panel)`
  flex-basis: 24%;
  flex-shrink: 0;
`;

const Panel50 = styled(Panel)`
  flex-basis: 49%;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
`;

const PromptCard = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: ${({ checked }) => (checked ? '#2d2d2d' : '#1a1a1a')};
  border: 1px solid ${({ checked }) => (checked ? '#00bfff' : '#333')};
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s, transform 0.2s, box-shadow 0.2s;

  &:hover {
    background-color: #2a2a2a;
    transform: translateY(-2px);
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  }

  &:active {
    transform: translateY(0);
    box-shadow: none;
  }

  input[type='radio'] {
    accent-color: #00bfff;
  }

  span {
    font-size: 14px;
  }
`;

const PromptSelection = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 450px; 
  overflow-y: auto;
  padding-right: 6px; // για να μην "κόβεται" το scrollbar
  margin-top: 10px;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%; 

  textarea {
    width: 100%;
    height: 100%;
    padding: 12px;
    border: 1px solid #444;
    border-radius: 6px;
    background-color: #1a1a1a;
    color: #ddd;
    font-family: monospace;
    font-size: 14px;
    resize: none;
    box-sizing: border-box; 
    margin-bottom: 10px;
  }

  button {
    width: 100%;
    background-color: #007bff;
    color: #fff;
    padding: 10px 15px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    box-sizing: border-box; 
  }
`;

const MessageContainer = styled.div`
  display: flex;
  justify-content: ${({ className }) =>
    className === "user" ? "flex-end" : "flex-start"};
  width: 100%;
  margin: 10px 0;

  .bubble {
    background-color: ${({ className }) =>
      className === "user" ? "#005eff" : "#2a2a2a"};
    color: white;
    padding: 12px 16px;
    border-radius: 12px;
    max-width: 80%;
    white-space: pre-wrap;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
    overflow-x: auto;
    font-size: 14px;
  }
`;

const MarkdownWrapper = styled.div`
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5rem 0;
    border: 1px solid #444;
  }

  th, td {
    border: 1px solid #444;
    padding: 10px;
    text-align: center;
    background-color: #1a1a1a;
    color: #fff;
  }

  thead {
    background-color: #2d2d2d;
    font-weight: bold;
  }

  tr:nth-child(even) {
    background-color: #222;
  }

  code {
    background-color: #2d2d2d;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.95em;
  }

  pre {
    background-color: #1a1a1a;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
  }
`;

const ChatWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 30px;
`;

const Bubble = styled.div`
  background-color:#1a1a1a;;
  color: white;
  padding: 12px 16px;
  max-width: 80%;
  border-radius: 12px;
  white-space: pre-wrap;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  font-size: 14px;
  overflow: visible;
  border: 3px solid transparent;
  white-space: normal;
  word-wrap: break-word;


  &.user {
    border-color: #007bff;
  }
`;

const SenderLabel = styled.div`
  font-size: 25px;
  font-weight: bold;
  margin-bottom: 4px;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ScrollIndicator = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #007bff;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  z-index: 999;
  
  transition: background-color 0.2s, transform 0.2s, box-shadow 0.2s;

  &:hover {
    background-color: #339dff;
    
    box-shadow: 0 4px 10px rgba(0, 123, 255, 0.4);
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;





const ChatComponent = () => {
  const [selectedModel, setSelectedModel] = useState("gpt-3.5");
  const [modelOptions, setModelOptions] = useState([]);
  const [modelMap, setModelMap] = useState({});
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState('prompt1');
  const [promptOptions, setPromptOptions] = useState([]);
  const firstAIRef = useRef(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  useEffect(() => {
    if (messages.length > 2) {
      setShowScrollIndicator(true);
    }
  }, [messages]);

  useEffect(() => {
    fetch('/models.json')
      .then(res => res.json())
      .then(data => {
        setModelOptions(data);
        const modelMapping = {};
        data.forEach(m => {
          modelMapping[m.id] = m.modelId;
        });
        setModelMap(modelMapping);
      })
      .catch(err => console.error("Failed to load models:", err));
  }, []);
  
  useEffect(() => {
    fetch("/prompts.json")
      .then(res => res.json())
      .then(data => setPromptOptions(data))
      .catch(err => console.error("Failed to load prompts:", err));
  }, []);
  



  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handlePromptChange = (e) => {
    setSelectedPrompt(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const systemRolePrompt = {
      role: "system",
      content: "From now on, you will act as an expert in the field of computer science who will help new programmers improve, modify, and understand pieces of code or generally understand the domain of computer science."
    };

    const selectedPromptObj = promptOptions.find(p => p.id === selectedPrompt);

    const userSelectedPrompt = selectedPromptObj
      ? {
          role: "user",
          content: selectedPromptObj.text
        }
      : null;
    

    const userMessage = {
      role: "user",
      content: input
    };

    const newMessages = [
      systemRolePrompt,
      ...(userSelectedPrompt ? [userSelectedPrompt] : []),
      ...messages.filter(m => m.role !== "system"),
      userMessage
    ];
    
    let retries = 3;

    while (retries > 0) {
      try {
        const response = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: modelMap[selectedModel],
            messages: newMessages,
          },
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
            },
          }
        );
        const errorMsg = response.data?.error?.message;
        if (errorMsg) {
          console.warn("⚠️ AI response error:", errorMsg);
          setMessages([...newMessages, { role: "assistant", content: `⚠️ ${errorMsg}` }]);
          return;
        }

        const assistantMessage =
          response.data.choices?.[0]?.message?.content || 
          response.data.message?.content ||               
          "No response from AI";
          

        setMessages([...newMessages, { role: "assistant", content: assistantMessage }]);
        setInput("");

        await axios.post("http://localhost:5000/api/log", {
          model: selectedModel,
          modelId: modelMap[selectedModel],
          promptId: selectedPrompt,
          userCode: input,
          aiResponse: assistantMessage,
          timestamp: new Date().toISOString()
        });
        
        
        return;
      } catch (error) {
        if (error.response?.status === 429) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          retries--;
        } else {
          const errorMsg = error.response?.data?.error?.message || error.message || "Unknown error";
          console.error("Error fetching response:", errorMsg);
          setMessages([...newMessages, { role: "assistant", content: `⚠️ ${errorMsg}` }]);
          break;
        }
      }
    }
  };

  return (
    <PageLayout>
      <TopPanelWrapper>
      {/* Panel 1: Select Model */}
      <Panel25>
        <h3>1. Select Model</h3>
        <ModelList>
          {modelOptions.map((model) => (
            <ModelOption
              key={model.id}
              selected={selectedModel === model.id}
              onClick={() => setSelectedModel(model.id)}
            >
              <img src={model.logo} alt={model.name} />
              <span>{model.name}</span>
            </ModelOption>
          ))}
        </ModelList>
      </Panel25>

      {/* Panel 2: Select Prompt */}
      <Panel25>
        <h3>2. Select Prompt</h3>
        <PromptSelection>
          {promptOptions.map((prompt) => (
            <PromptCard key={prompt.id} checked={selectedPrompt === prompt.id}>
            <input
              type="radio"
              name="prompt"
              value={prompt.id}
              checked={selectedPrompt === prompt.id}
              onChange={handlePromptChange}
            />
            <span>{prompt.label}</span>
          </PromptCard>
        ))}
      </PromptSelection>

      </Panel25>

      {/* Panel 3: Input & Output */}
      <Panel50>
      <h3>3. Enter your code here</h3>
      <InputContainer>
        <textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Enter your code here..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </InputContainer>
    </Panel50>
  </TopPanelWrapper>

  <ChatWrapper>
  {messages
  .filter((_, index) => index >= 2)
  .map((message, index, arr) => {
    const isFirstAI = message.role === "assistant" &&
      !arr.slice(0, index).some(m => m.role === "assistant");

      return (
        <MessageContainer
          key={index}
          className={message.role}
          ref={isFirstAI ? firstAIRef : null} 
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: message.role === "user" ? "flex-end" : "flex-start"
            }}
          >
            <SenderLabel>{message.role === "user" ? "YOU" : "AI"}</SenderLabel>
            <Bubble className={message.role}>
              {message.role === "user" ? (
                <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {message.content}
                </pre>
              ) : (
                <MarkdownWrapper>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </MarkdownWrapper>
              )}
            </Bubble>
          </div>
        </MessageContainer>
      );
    })}
  
</ChatWrapper>

{showScrollIndicator && (
  <ScrollIndicator
    onClick={() => {
      firstAIRef.current?.scrollIntoView({ behavior: "smooth" });
      setShowScrollIndicator(false);
    }}
  >
    ↓ Scroll to view answer
  </ScrollIndicator>
)}


</PageLayout>
  );
};

export default ChatComponent;
