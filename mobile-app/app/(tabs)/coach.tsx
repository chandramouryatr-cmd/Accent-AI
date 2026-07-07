// AI Coach chat — streams replies from the existing Next.js /api/ai-coach endpoint.

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Send, Sparkles, Trash2, User, Mic } from "lucide-react-native";
import { useAppStore, type ChatMessage } from "@/lib/store";
import { streamCoachReply } from "@/lib/api";
import { colors, typography } from "@/lib/theme";

const SUGGESTIONS = [
  "How do I pronounce /θ/ vs /ð/?",
  "What's the difference between /æ/ and /e/?",
  "Help me with word stress in 'photograph'",
  "Tips for American R sound?",
];

export default function Coach() {
  const chatMessages = useAppStore((s) => s.chatMessages);
  const addChatMessage = useAppStore((s) => s.addChatMessage);
  const clearChat = useAppStore((s) => s.clearChat);
  const accent = useAppStore((s) => s.accent);

  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (chatMessages.length === 0) {
      addChatMessage({
        id: "welcome",
        role: "assistant",
        content:
          "Hi there! 👄 I'm your AccentAI Coach. Ask me about any English sound, word, or pronunciation challenge and I'll break it down with IPA and concrete practice tips. 🎯",
        timestamp: Date.now(),
      });
    }
  }, []);

  const send = async (text: string) => {
    if (!text.trim() || streaming) return;
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: Date.now(),
    };
    addChatMessage(userMsg);
    setInput("");
    setStreaming(true);
    setStreamingText("");

    const history = [...chatMessages.filter((m) => m.id !== "welcome"), userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      let fullText = "";
      await streamCoachReply(history, (token) => {
        fullText += token;
        setStreamingText(fullText);
        flatListRef.current?.scrollToEnd({ animated: true });
      });

      addChatMessage({
        id: `a-${Date.now()}`,
        role: "assistant",
        content: fullText || "(no reply)",
        timestamp: Date.now(),
      });
    } catch (err) {
      addChatMessage({
        id: `a-${Date.now()}`,
        role: "assistant",
        content: "⚠️ I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: Date.now(),
      });
    } finally {
      setStreaming(false);
      setStreamingText("");
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage | { streaming: true; text: string } }) => {
    const isUser = "role" in item && item.role === "user";
    const content = "streaming" in item ? item.text : item.content;

    return (
      <View style={{ flexDirection: "row", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 12, paddingHorizontal: 4 }}>
        {!isUser && (
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: colors.primarySoft,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 8,
              marginTop: 2,
            }}
          >
            <Sparkles size={14} color={colors.primary} />
          </View>
        )}
        <View
          style={{
            maxWidth: "78%",
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderRadius: 16,
            borderBottomRightRadius: isUser ? 4 : 16,
            borderBottomLeftRadius: isUser ? 16 : 4,
            backgroundColor: isUser ? colors.primary : colors.surface,
          }}
        >
          <Text style={{ color: isUser ? "#fff" : colors.foreground, fontSize: 15, lineHeight: 21 }}>
            {content}
          </Text>
        </View>
        {isUser && (
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: colors.surfaceAlt,
              alignItems: "center",
              justifyContent: "center",
              marginLeft: 8,
              marginTop: 2,
            }}
          >
            <User size={14} color={colors.muted} />
          </View>
        )}
      </View>
    );
  };

  const data: (ChatMessage | { streaming: true; text: string; id: string })[] = [
    ...chatMessages,
    ...(streaming ? [{ id: "streaming", streaming: true as const, text: streamingText }] : []),
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.primarySoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={[typography.h3, { fontSize: 16 }]}>AI Coach</Text>
            <Text style={[typography.caption, { color: colors.muted }]}>
              {accent === "uk" ? "British English" : "American English"} · expert IPA help
            </Text>
          </View>
        </View>
        <Pressable onPress={clearChat} hitSlop={12}>
          <Trash2 size={18} color={colors.muted} />
        </Pressable>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={data}
        keyExtractor={(item, idx) => ("id" in item ? item.id : `idx-${idx}`)}
        renderItem={renderMessage}
        contentContainerStyle={{ padding: 16, paddingTop: 12 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={null}
      />

      {/* Suggestions */}
      {chatMessages.length <= 1 && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          <Text style={[typography.caption, { color: colors.muted, marginBottom: 8 }]}>
            Try asking:
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {SUGGESTIONS.map((s) => (
              <Pressable
                key={s}
                onPress={() => send(s)}
                style={({ pressed }) => ({
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 100,
                  backgroundColor: pressed ? colors.surface : "#fff",
                })}
              >
                <Text style={[typography.caption, { fontWeight: "500" }]}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            gap: 8,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: "#fff",
          }}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask your coach anything…"
            placeholderTextColor={colors.subtle}
            multiline
            maxLength={1000}
            style={{
              flex: 1,
              minHeight: 40,
              maxHeight: 100,
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 20,
              fontSize: 15,
              backgroundColor: colors.surface,
            }}
          />
          <Pressable
            onPress={() => send(input)}
            disabled={!input.trim() || streaming}
            style={({ pressed }) => ({
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: input.trim() && !streaming ? colors.primary : colors.surfaceAlt,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            {streaming ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Send size={18} color={input.trim() ? "#fff" : colors.muted} />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
