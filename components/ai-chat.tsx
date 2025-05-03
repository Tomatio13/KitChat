"use client"

import React, { useEffect, useCallback, useState, useRef } from 'react'
import { Send, Trash2, BrainCircuit, Mic, MicOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import TextareaAutosize from 'react-textarea-autosize'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Message, CreateMessage } from 'ai/react'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'
import ReactMarkdown from 'react-markdown'


interface AvailableModel {
  id: string;
  name: string;
}

interface AIChatProps {
  messages: Message[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  clearMessages: () => void;
  setInput?: (value: string | ((prevInput: string) => string)) => void;
  append?: (message: CreateMessage, options?: { body?: Record<string, any> }) => Promise<string | null | undefined>;
  isDarkMode?: boolean;
}

// SpeechRecognition用のインターフェース定義
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (event: Event) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: (event: Event) => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

// Window インターフェースを拡張
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// MessageItem コンポーネントを修正して Markdown パーサーを使用
const MessageItem = React.memo(({
  message,
  isLoading,
  isDarkMode,
}: {
  message: Message;
  isLoading: boolean;
  isDarkMode: boolean;
}) => {
    // Markdownパーサーを使用したレンダリング
    const MessageContent = React.useMemo(() => (
      <div className="whitespace-pre-wrap text-sm leading-relaxed">
        {message.role === 'user' ? (
          // ユーザーメッセージはそのまま表示
          <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
        ) : (
          // AIメッセージはMarkdownとして表示
          <ReactMarkdown
            className="markdown-content leading-none text-xs"
            components={{
              pre: ({ node, ...props }) => (
                <div className="my-0 rounded overflow-hidden">
                  <pre 
                    className={`p-1 overflow-auto ${isDarkMode ? 'bg-[#0d1117] text-[#e6edf3]' : 'bg-gray-100 text-gray-800'}`}
                    suppressHydrationWarning
                    {...props}
                  />
                </div>
              ),
              code: ({ node, className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || '');
                return (
                  <>
                    {match ? (
                      <div>
                        <div 
                          className={`px-1 py-0 text-[10px] ${isDarkMode ? 'bg-[#161b22] text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                          suppressHydrationWarning
                        >
                          {match[1]}
                        </div>
                        <code 
                          className={className}
                          suppressHydrationWarning
                          {...props}
                        >
                          {children}
                        </code>
                      </div>
                    ) : (
                      <code 
                        className={`px-0.5 rounded ${isDarkMode ? 'bg-[#161b22] text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                        suppressHydrationWarning
                        {...props}
                      >
                        {children}
                      </code>
                    )}
                  </>
                );
              },
              a: ({ node, ...props }) => (
                <a 
                  className={`${isDarkMode ? 'text-green-400' : 'text-green-600'} hover:underline break-words font-medium`}
                  target="_blank"
                  rel="noopener noreferrer"
                  suppressHydrationWarning
                  {...props}
                />
              ),
              p: ({ node, ...props }) => (
                <p 
                  className="my-0 break-words leading-tight"
                  suppressHydrationWarning
                  {...props}
                />
              ),
              ul: ({ node, ...props }) => (
                <ul 
                  className="list-disc pl-3 my-0"
                  suppressHydrationWarning
                  {...props}
                />
              ),
              ol: ({ node, ...props }) => (
                <ol 
                  className="list-decimal pl-3 my-0"
                  suppressHydrationWarning
                  {...props}
                />
              ),
              li: ({ node, ...props }) => (
                <li 
                  className="my-0 py-0 break-words"
                  suppressHydrationWarning
                  {...props}
                />
              ),
              h1: ({ node, ...props }) => (
                <h1 
                  className="text-sm font-bold mt-0.5 mb-0 break-words"
                  suppressHydrationWarning
                  {...props}
                />
              ),
              h2: ({ node, ...props }) => (
                <h2 
                  className="text-xs font-bold mt-0.5 mb-0 break-words"
                  suppressHydrationWarning
                  {...props}
                />
              ),
              h3: ({ node, ...props }) => (
                <h3 
                  className="text-xs font-semibold mt-0.5 mb-0 break-words"
                  suppressHydrationWarning
                  {...props}
                />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote 
                  className={`pl-1 border-l ${isDarkMode ? 'border-gray-600 bg-[#161b22]' : 'border-gray-300 bg-gray-50'} my-0`}
                  suppressHydrationWarning
                  {...props}
                />
              ),
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto my-0">
                  <table 
                    className={`min-w-full border-collapse text-[10px] ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}
                    suppressHydrationWarning
                    {...props}
                  />
                </div>
              ),
              th: ({ node, ...props }) => (
                <th 
                  className={`px-1 py-0 ${isDarkMode ? 'bg-[#21262d] border-gray-700' : 'bg-gray-100 border-gray-300'} border`}
                  suppressHydrationWarning
                  {...props}
                />
              ),
              td: ({ node, ...props }) => (
                <td 
                  className={`px-1 py-0 ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} border break-words`}
                  suppressHydrationWarning
                  {...props}
                />
              ),
              hr: ({ node, ...props }) => (
                <hr
                  className="my-0 border-t"
                  suppressHydrationWarning
                  {...props}
                />
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    ), [message.content, message.role, isDarkMode]);

    return (
        <div className="pb-3"> {/* Virtuosoのアイテム間のスペース */}
            <Card
                key={message.id} // key は Virtuoso の itemContent 内で適用
                className={`
                    max-w-[90%] rounded-lg shadow-sm
                    ${message.role === 'user'
                        ? isDarkMode
                            ? 'bg-[#161b22] text-[#e6edf3] ml-auto'
                            : 'bg-blue-50 ml-auto'
                        : isDarkMode
                            ? 'bg-[#21262d] text-[#e6edf3] mr-auto'
                            : 'bg-white mr-auto'
                    }
                    ${isDarkMode ? 'border border-[#30363d]' : 'border border-gray-200'}
                `}
                suppressHydrationWarning
            >
                <CardContent className="p-1.5">
                    {MessageContent}
                </CardContent>
            </Card>
        </div>
    );
});
MessageItem.displayName = 'MessageItem';

// Virtuoso を使用する新しいメッセージリストコンポーネント
const MessageList = React.memo(({
  messages,
  isLoading,
  isDarkMode,
  virtuosoRef, // Virtuosoの制御用Ref
}: {
  messages: Message[];
  isLoading: boolean;
  isDarkMode: boolean;
  virtuosoRef: React.RefObject<VirtuosoHandle>;
}) => {
  console.log('Rendering MessageList (Virtuoso)');

  const renderLoader = () => {
    // ストリーミング中に重複してローディング表示が出ないように条件を調整
    if (isLoading && (!messages.length || messages[messages.length - 1]?.role === 'user')) {
        return (
            <div className="p-4 flex justify-center">
                <Card className={`max-w-[90%] mr-auto rounded-lg shadow-sm ${isDarkMode ? 'bg-[#21262d] text-[#e6edf3] border border-[#30363d]' : 'bg-white border border-gray-200'}`}>
                    <CardContent className="p-3">
                        <p className="text-sm animate-pulse">回答を生成中...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }
    return null;
  };

  return (
    <Virtuoso
      ref={virtuosoRef} // Ref を設定
      style={{ flex: 1 }} // 親要素の高さに追従させる
      data={messages} // 表示するデータ配列
      followOutput="smooth" // 新しい項目が追加されたらスムーズに追従スクロール
      itemContent={(index, message) => (
        // 個々のメッセージアイテムをレンダリング
        <MessageItem
          message={message}
          isLoading={isLoading} // 個々のアイテムではisLoadingは主に「挿入」ボタンの制御に使う
          isDarkMode={isDarkMode}
        />
      )}
      components={{ Footer: renderLoader }} // ローディング表示をフッターに追加
    />
  );
});
MessageList.displayName = 'MessageList';

// 応答完了時に自動的にスクロールする処理を追加
const useAutoScrollToBottom = (
  messages: Message[],
  isLoading: boolean,
  virtuosoRef: React.RefObject<VirtuosoHandle>
) => {
  // 前回のメッセージ数を保持
  const prevMessagesCountRef = useRef(messages.length);
  
  useEffect(() => {
    // ローディング状態が変わるたびに実行
    const currentCount = messages.length;
    const prevCount = prevMessagesCountRef.current;
    
    // 1. ローディングが完了した時
    // 2. 新しいメッセージが追加された時
    if ((!isLoading && prevCount < currentCount) || (!isLoading && messages.length > 0)) {
      // 少し遅延させてスクロール（レンダリング完了を待つ）
      setTimeout(() => {
        virtuosoRef.current?.scrollToIndex({
          index: messages.length - 1,
          behavior: 'smooth',
        });
      }, 100);
    }
    
    // 現在のカウントを記録
    prevMessagesCountRef.current = currentCount;
  }, [isLoading, messages, virtuosoRef]);
};

export function AIChat({
  messages,
  input,
  handleInputChange,
  isLoading,
  clearMessages,
  setInput,
  append,
  isDarkMode = false,
}: AIChatProps) {
  const [availableModels, setAvailableModels] = useState<AvailableModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const virtuosoRef = useRef<VirtuosoHandle>(null); // Virtuoso の Ref を作成
  
  // 音声認識関連の状態
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recognizedText, setRecognizedText] = useState<string>('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  // 無音検出用の変数を追加
  const lastSpeechRef = useRef<number>(0);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  // 音声認識での送信を追跡する変数
  const hasSentAfterRecognitionRef = useRef<boolean>(false);
  // 最新の入力内容を直接保持するrefを追加（Reactの状態更新の非同期性を回避）
  const latestInputRef = useRef<string>('');
  // 無音検出による停止かどうかを追跡する変数
  const stoppedDueToSilenceRef = useRef<boolean>(false);

  // 入力内容が変更されたらrefも更新する
  useEffect(() => {
    latestInputRef.current = input;
  }, [input]);
  
  // 送信関数を事前に定義
  const sendMessage = useCallback(async (content: string) => {
    if (!append) {
      console.error("append関数が提供されていません。");
      return;
    }
    if (!selectedModel) {
      console.error("送信するモデルが選択されていません。");
      alert("使用するAIモデルを選択してください。");
      return;
    }

    console.log(`モデル '${selectedModel}' を使用してメッセージを送信します。`);

    try {
      await append(
        { content, role: 'user' },
        { body: { model: selectedModel } }
      );
      if (setInput) {
        setInput('');
        latestInputRef.current = ''; // refも空にする
      }
    } catch (error) {
      console.error("メッセージ送信エラー:", error);
      alert(`メッセージの送信中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [append, selectedModel, setInput]);

  // handleFormSubmit を useCallback でメモ化
  const handleFormSubmitCallback = useCallback(async (e?: React.FormEvent<HTMLFormElement>, forceContent?: string) => {
    e?.preventDefault();

    // 強制的に指定された内容か、latestInputRefの内容、またはinputの内容を使用
    const contentToUse = forceContent || latestInputRef.current || input;
    const trimmedInput = contentToUse.trim();
    
    console.log('送信処理実行:', trimmedInput, '長さ:', trimmedInput.length);
    if (!trimmedInput) return;

    // "クリア" と入力された場合の処理を追加
    if (trimmedInput === 'クリア') {
      console.log('入力が "クリア" のため、メッセージをクリアします。');
      clearMessages();
      if (setInput) {
        setInput('');
        latestInputRef.current = ''; // refも空にする
      }
      return; // sendMessage をスキップ
    }

    await sendMessage(trimmedInput);
  }, [input, sendMessage, clearMessages, setInput]);

  // 音声認識の停止処理
  const stopRecognition = useCallback(() => {
    console.log('音声認識を停止します');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('音声認識停止エラー:', error);
      }
      recognitionRef.current = null;
    }
    
    if (silenceTimerRef.current) {
      clearInterval(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    setIsListening(false);
    setRecognizedText("");
  }, []);

  // 音声認識開始関数
  const startSpeechRecognition = useCallback(() => {
    // ブラウザに音声認識APIがあるか確認
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("お使いのブラウザは音声認識をサポートしていません。");
      return;
    }

    // すでに認識中なら何もしない
    if (recognitionRef.current) {
      return;
    }

    console.log('音声認識を初期化します');

    // 送信済みフラグをリセット
    hasSentAfterRecognitionRef.current = false;

    // 最後の音声検出時間を現在の時間に設定
    lastSpeechRef.current = Date.now();

    // 音声認識の初期化
    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true; // 継続的な認識を有効に
      recognition.interimResults = true;
      recognition.lang = 'ja-JP';

      // イベントハンドラー
      recognition.onstart = () => {
        setIsListening(true);
        setRecognizedText("");
        console.log(`[${new Date().toISOString()}] 音声認識プロセス開始 (onstart)`);
      };

      // 拡張イベントのサポート（TypeScriptの型定義にないため、anyでキャスト）
      (recognition as any).onaudiostart = () => {
        console.log(`[${new Date().toISOString()}] オーディオ入力の受け取りを開始しました (onaudiostart)`);
        // 無音検出タイマーをここで設定
        setTimeout(() => {
          console.log(`[${new Date().toISOString()}] onaudiostart から 200ms 後、無音検出タイマーを開始します`);
          if (!silenceTimerRef.current && recognitionRef.current) { // 二重起動防止と参照確認
              lastSpeechRef.current = Date.now(); // タイマー開始時の時刻をセット
              silenceTimerRef.current = setInterval(() => {
                const now = Date.now();
                const silenceDuration = now - lastSpeechRef.current;
    
                // 2秒以上無音が続き、かつ入力欄に送信すべきテキストが存在する場合のみ
                // 音声認識を停止して自動送信をトリガーする。
                // 入力が空（＝まだ確定した音声が無い）場合は、
                // 無音状態でも聞き続けるようにする。
                if (silenceDuration > 2000 && latestInputRef.current.trim() !== '') {
                  console.log('2秒間無音かつ入力あり→音声認識を終了して自動送信します');

                  // 無音検出による停止フラグを設定（フラグは設定するが、再開時にリセットする）
                  stoppedDueToSilenceRef.current = true;

                  // stopRecognition を呼び出すとタイマーがクリアされるため、ここでは直接 stop() を呼ぶ
                  if(recognitionRef.current) {
                    try {
                      recognitionRef.current.stop();
                    } catch(e) { console.error("Error stopping recognition in timer:", e); }
                  }
                }
              }, 200); // 1秒ごとにチェック
          }
        }, 100); // 200ms の遅延
      };

      (recognition as any).onspeechstart = () => {
        console.log(`[${new Date().toISOString()}] ★音声入力を検出しました - 認識開始 (onspeechstart)`);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        // 最初の result イベントのタイムスタンプも記録
        if (event.resultIndex === 0) {
            console.log(`[${new Date().toISOString()}] 最初の認識結果受信 (onresult)`);
        }
        // 音声が検出されたので最終検出時間を更新
        lastSpeechRef.current = Date.now();
        
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          // スペースをトリムして取得
          const transcript = event.results[i][0].transcript.trim();
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        console.log('認識中:', interimTranscript || finalTranscript);
        
        // 認識された文字列を表示
        setRecognizedText(interimTranscript || finalTranscript);

        // 確定した文字列を入力欄に追加
        if (finalTranscript) {
          if (setInput) {
            console.log('確定した音声入力を追加:', finalTranscript.trim());
            // 現在の入力と結合して、直接refにも設定
            const newInput = latestInputRef.current + (latestInputRef.current.length > 0 && !latestInputRef.current.endsWith(' ') ? ' ' : '') + finalTranscript.trim();
            latestInputRef.current = newInput;
            
            // 状態も更新
            setInput((currentInput: string) => {
              const trimmedFinal = finalTranscript.trim();
              return currentInput + (currentInput.length > 0 && !currentInput.endsWith(' ') ? ' ' : '') + trimmedFinal;
            });
          }
          setRecognizedText("");
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error(`[${new Date().toISOString()}] 音声認識エラー (onerror):`, event.error);
        stopRecognition();
        
        // エラー後も音声認識を再開試行
        setTimeout(() => {
          if (!recognitionRef.current && !hasSentAfterRecognitionRef.current) {
            console.log('エラー後に音声認識を再開します');
            startSpeechRecognition();
          }
        }, 1000);
      };

      recognition.onend = () => {
        console.log(`[${new Date().toISOString()}] 音声認識終了 (onend)`);
        // リソースのクリーンアップ
        if (recognitionRef.current) {
          recognitionRef.current = null;
        }
        
        if (silenceTimerRef.current) {
          clearInterval(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
        
        setIsListening(false);
        setRecognizedText("");
        
        // onendイベントの場合も入力があれば送信
        setTimeout(() => {
          const currentInput = latestInputRef.current || input;
          console.log('音声認識終了後の送信処理を呼び出し, 現在の入力:', currentInput.trim());
          
          if (currentInput.trim() && !hasSentAfterRecognitionRef.current) {
            hasSentAfterRecognitionRef.current = true;
            
            handleFormSubmitCallback(undefined, currentInput.trim())
              .then(() => {
                setTimeout(() => {
                  hasSentAfterRecognitionRef.current = false;
                  // 無音検出による停止でも再開する（フラグをチェックしない）
                  if (!recognitionRef.current) {
                    console.log('送信後に音声認識を再開します');
                    // 停止フラグをリセット
                    stoppedDueToSilenceRef.current = false;
                    startSpeechRecognition();
                  }
                }, 500);
              });
          } else if (!hasSentAfterRecognitionRef.current) {
            // 入力が空でも音声認識を再開（無音検出チェックを行わない）
            setTimeout(() => {
              if (!recognitionRef.current) {
                console.log('入力が空ですが、音声認識を再開します');
                // 停止フラグをリセット
                stoppedDueToSilenceRef.current = false;
                startSpeechRecognition();
              }
            }, 500);
          }
        }, 500);
      };

      // 認識開始前にログを出力
      console.log(`[${new Date().toISOString()}] recognition.start() を呼び出します...`);
      
      // 認識開始
      recognition.start();
      console.log(`[${new Date().toISOString()}] recognition.start() を呼び出しました。`);
    } catch (error) {
      console.error('音声認識の初期化エラー:', error);
      stopRecognition();
    }
  }, [setInput, stopRecognition, input, handleFormSubmitCallback]);

  // 音声認識の切り替え
  const toggleSpeechRecognition = useCallback(() => {
    console.log('音声認識切り替え, 現在の状態:', isListening, '参照:', !!recognitionRef.current);
    if (isListening && recognitionRef.current) {
      console.log('音声認識を手動で停止します');
      
      // 手動停止のため、自動送信は行わない
      // 手動停止フラグを立てる（再開や自動送信を防止）
      hasSentAfterRecognitionRef.current = true;
      
      // 音声認識を停止
      stopRecognition();
    } else {
      console.log('音声認識を開始します');
      
      // 音声認識開始前にフラグをリセット
      hasSentAfterRecognitionRef.current = false;
      stoppedDueToSilenceRef.current = false; // 無音停止フラグをリセット
      startSpeechRecognition();
    }
  }, [isListening, startSpeechRecognition, stopRecognition]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      stopRecognition();
    };
  }, [stopRecognition]);

  useEffect(() => {
    const fetchAvailableModels = async () => {
      try {
        const response = await fetch('/api/chat');
        if (!response.ok) {
          throw new Error(`モデルリストの取得に失敗しました: ${response.statusText}`);
        }
        const models: AvailableModel[] = await response.json();
        setAvailableModels(models);
        if (models.length > 0 && !selectedModel) {
          setSelectedModel(models[0].id);
        }
      } catch (error) {
        console.error("利用可能なモデルの取得エラー:", error);
      }
    };

    if (availableModels.length === 0) {
        fetchAvailableModels();
    }
  }, [availableModels, selectedModel]);

  // handleKeyDown を useCallback でメモ化
  const handleKeyDownCallback = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // キーボードイベント自体のデフォルト動作（改行）は防ぐ
      if (!isLoading && input.trim()) {
        // 引数を渡さずに呼び出す
        handleFormSubmitCallback(); 
      }
    }
  }, [isLoading, input, handleFormSubmitCallback]); // 依存関係を更新

  // clearMessages を useCallback でメモ化 (親コンポーネントでのメモ化も推奨)
  const clearMessagesCallback = useCallback(() => {
    clearMessages();
  }, [clearMessages]);

  // 新しいメッセージが追加されたときに一番下にスクロールさせる
  useEffect(() => {
    if (virtuosoRef.current) {
        // followOutput="smooth"があるので基本不要だが、念のため
      virtuosoRef.current.scrollToIndex({ index: messages.length - 1, align: 'end', behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div 
      className={`flex flex-col h-full ${isDarkMode ? 'bg-[#0d1117] text-[#e6edf3]' : 'bg-gray-100 text-gray-900'}`}
      suppressHydrationWarning
    >
      <div 
        className={`flex justify-between items-center px-4 py-2 ${isDarkMode ? 'border-b border-[#30363d]' : 'border-b border-gray-200'}`}
        suppressHydrationWarning
      >
        <h3 className="text-base font-semibold flex items-center">
          <BrainCircuit className="mr-2 h-5 w-5" />
          AIチャット
        </h3>
        <div className="flex items-center gap-2">
          {availableModels.length > 0 && (
             <Select
               value={selectedModel}
               onValueChange={setSelectedModel}
               disabled={isLoading}
             >
               <SelectTrigger 
                 className={`w-[180px] h-8 text-xs ${isDarkMode ? 'bg-[#161b22] border-[#30363d]' : 'bg-white'}`}
                 suppressHydrationWarning
               >
                 <SelectValue placeholder="モデルを選択..." />
               </SelectTrigger>
               <SelectContent>
                 {availableModels.map((model) => (
                   <SelectItem key={model.id} value={model.id} className="text-xs">
                     {model.name}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearMessagesCallback}
            disabled={isLoading || messages.length === 0}
            className={`text-xs px-2 py-1 ${isDarkMode ? 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3]' : 'text-gray-600 hover:bg-gray-200'}`}
            suppressHydrationWarning
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            クリア
          </Button>
        </div>
      </div>
      <div className="flex-grow h-[calc(100%-7.5rem-28px)] p-4 overflow-y-auto"> {/* LEDスキャナーの高さ分を引く */}
        <MessageList
          messages={messages}
          isLoading={isLoading}
          isDarkMode={isDarkMode}
          virtuosoRef={virtuosoRef}
        />
      </div>

      {/* LEDスキャナーライト - 常に表示（音声入力中のみアニメーション） */}
      <div className="w-full h-7 overflow-hidden">
        <div 
          className={`h-7 w-full flex justify-center items-center border-t border-b ${isDarkMode ? 'border-[#30363d] bg-[#0d1117]' : 'border-gray-200 bg-gray-50'}`}
          suppressHydrationWarning
        >
          <div className="flex justify-between w-[90%] max-w-[600px]">
            {Array.from({ length: 16 }).map((_, index) => (
              <div 
                key={index}
                className="h-3 w-3 rounded-full transition-all duration-300"
                style={{
                  animation: isListening ? `knightRiderLed 3s infinite ease-in-out` : 'none',
                  animationDelay: isListening ? `${Math.abs(7.5 - index) * 0.1}s` : '0s',
                  backgroundColor: isDarkMode 
                    ? isListening ? '#0d1117' : '#21262d' 
                    : isListening ? '#e5e7eb' : '#d1d5db'
                }}
                suppressHydrationWarning
              />
            ))}
          </div>
          <style jsx>{`
            @keyframes knightRiderLed {
              0%, 100% { 
                transform: scale(1);
                background-color: ${isDarkMode ? '#0d1117' : '#e5e7eb'};
                box-shadow: none;
              }
              15%, 35% { 
                transform: scale(1.2);
                background-color: #ef4444;
                box-shadow: 0 0 8px 2px rgba(220, 38, 38, 0.8);
              }
              50% {
                transform: scale(1);
                background-color: ${isDarkMode ? '#0d1117' : '#e5e7eb'};
                box-shadow: none;
              }
              65%, 85% {
                transform: scale(1.2);
                background-color: #ef4444;
                box-shadow: 0 0 8px 2px rgba(220, 38, 38, 0.8);
              }
            }
          `}</style>
        </div>
      </div>

      <form 
        onSubmit={handleFormSubmitCallback} 
        className={`p-4 border-t ${isDarkMode ? 'border-[#30363d] bg-[#0d1117]' : 'border-gray-200 bg-gray-100'}`}
        suppressHydrationWarning
      >
        <div className="flex items-start gap-2">
          <TextareaAutosize
            value={recognizedText ? `${input}${input && !input.endsWith(' ') ? ' ' : ''}${recognizedText}` : input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDownCallback}
            placeholder="AIに質問する... (Shift+Enterで改行)"
            className={`flex-1 rounded-md text-sm resize-none border border-input bg-background px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${isDarkMode ? 'bg-[#161b22] border-[#30363d] text-[#e6edf3] placeholder-[#8b949e] focus:border-[#58a6ff] focus:ring-[#58a6ff]' : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
            disabled={isLoading || availableModels.length === 0}
            minRows={1}
            maxRows={6}
            suppressHydrationWarning
          />
          <Button
            type="button"
            size="icon"
            onClick={toggleSpeechRecognition}
            className={`rounded-md ${
              isDarkMode
                ? isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-[#21262d] hover:bg-[#30363d]'
                : isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-300 hover:bg-gray-400'
            } text-white`}
            suppressHydrationWarning
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </Button>
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim() || availableModels.length === 0 || !selectedModel}
            className={`rounded-md ${
              isDarkMode
                ? 'bg-[#238636] hover:bg-[#2ea043] text-white disabled:bg-[#21262d] disabled:text-[#8b949e]'
                : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400'
            }`}
            suppressHydrationWarning
          >
            <Send size={18} />
          </Button>
        </div>
      </form>
    </div>
  )
} 