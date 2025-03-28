(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["static/chunks/src_18fed9._.js", {

"[project]/src/models/chatMessage.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "ChatMessageStatus": (()=>ChatMessageStatus)
});
var ChatMessageStatus = /*#__PURE__*/ function(ChatMessageStatus) {
    ChatMessageStatus[ChatMessageStatus["RECEIVED"] = 0] = "RECEIVED";
    ChatMessageStatus[ChatMessageStatus["DELIVERED"] = 1] = "DELIVERED";
    return ChatMessageStatus;
}({});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/ChatPage.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>ChatPage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/src/context/AuthProvider.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sockjs$2d$client$2f$lib$2f$entry$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/sockjs-client/lib/entry.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$chatMessage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/src/models/chatMessage.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/src/lib/index.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$stomp$2f$stompjs$2f$esm6$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/@stomp/stompjs/esm6/client.js [app-client] (ecmascript)");
;
var _s = __turbopack_refresh__.signature();
;
;
;
;
;
;
;
function ChatPage() {
    _s();
    const stompClientRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const [chatRooms, setChatRooms] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Map());
    // grouped chat messages by chatId [chatId: [messages]]
    const [chatRoomMessages, setChatRoomMessages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Map());
    const [inputMessage, setInputMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    // Current chat id for users
    const [currentChatId, setCurrentChatId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [currentCompanion, setCurrentCompanion] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatPage.useEffect": ()=>{
            if (!user) return;
            const stompClient = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$stomp$2f$stompjs$2f$esm6$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Client"]({
                webSocketFactory: {
                    "ChatPage.useEffect": ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sockjs$2d$client$2f$lib$2f$entry$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]('http://localhost:8080/ws')
                }["ChatPage.useEffect"],
                debug: console.log,
                onConnect: onConnected,
                onStompError: {
                    "ChatPage.useEffect": (frame)=>{
                        console.error('Broker reported error: ' + frame.headers['message']);
                        console.error('Additional details: ' + frame.body);
                    }
                }["ChatPage.useEffect"]
            });
            stompClient.activate();
            stompClientRef.current = stompClient;
            return ({
                "ChatPage.useEffect": ()=>stompClient.deactivate()
            })["ChatPage.useEffect"];
        }
    }["ChatPage.useEffect"], [
        user
    ]);
    const onConnected = async ()=>{
        if (!user) return;
        console.log('Successfully connected to STOMP client.');
        stompClientRef.current?.subscribe(`/user/${user?.email}/queue/messages`, onPrivateMessageReceived);
        const companionEmail = searchParams.get('companionEmail');
        if (companionEmail) {
            const { chatId } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].chat.getOrCreateChatId(user.email, companionEmail);
            selectChat(chatId, user.email, companionEmail);
        }
        fetchAndSetChatRooms();
    };
    const fetchAndSetChatRooms = async (email = user?.email)=>{
        if (!email) return;
        const rooms = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].chat.fetchChatRooms(email);
        setChatRooms(new Map(rooms.map((chatRoom)=>[
                chatRoom.chatId,
                chatRoom
            ])));
    };
    const fetchAndSetChatRoomMessages = async (sender = user?.email, recipient = currentCompanion, chatId = currentChatId)=>{
        if (!sender || !currentCompanion || !chatId) return;
        const messages = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].chat.fetchChatRoomMessages(sender, recipient);
        const newChatRoomMessages = new Map(chatRoomMessages);
        newChatRoomMessages.set(currentChatId, messages);
        setChatRoomMessages(newChatRoomMessages);
    };
    const onPrivateMessageReceived = (message)=>{
        const chatMessage = JSON.parse(message.body);
        if (!chatRooms.has(chatMessage.chatId)) {
            fetchAndSetChatRooms();
        }
        setChatRoomMessages((prevChatRoomMessages)=>{
            const newChatRoomMessages = new Map(prevChatRoomMessages);
            const messages = newChatRoomMessages.get(chatMessage.chatId) || [];
            newChatRoomMessages.set(chatMessage.chatId, [
                ...messages,
                chatMessage
            ]);
            return newChatRoomMessages;
        });
    };
    const selectChat = async (chatId, sender = user?.email, companionEmail)=>{
        if (!sender) {
            return;
        }
        setCurrentChatId(chatId);
        setCurrentCompanion(companionEmail);
        await fetchAndSetChatRoomMessages(sender, companionEmail, chatId);
    };
    if (!user) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: "Loading..."
        }, void 0, false, {
            fileName: "[project]/src/components/ChatPage.tsx",
            lineNumber: 103,
            columnNumber: 16
        }, this);
    }
    const handleInputMessage = (e)=>{
        e.preventDefault();
        setInputMessage(e.target.value);
    };
    const sendMessage = ()=>{
        const stompClient = stompClientRef.current;
        if (!user || !stompClient || inputMessage.trim() === '') return;
        console.log(`sending message: ${inputMessage} to ${currentCompanion} from ${user.email}`);
        const message = {
            chatId: currentChatId,
            type: 'MESSAGE',
            content: inputMessage,
            recipient: currentCompanion,
            sender: user.email,
            status: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$chatMessage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ChatMessageStatus"].DELIVERED,
            timestamp: new Date()
        };
        stompClient.publish({
            destination: '/app/chat',
            body: JSON.stringify(message)
        });
        setInputMessage('');
        setChatRoomMessages((prevChatRoomMessages)=>{
            const newChatRoomMessages = new Map(prevChatRoomMessages);
            const messages = newChatRoomMessages.get(currentChatId) || [];
            message.id = crypto.randomUUID();
            newChatRoomMessages.set(currentChatId, [
                ...messages,
                message
            ]);
            return newChatRoomMessages;
        });
        if (!chatRooms.has(currentChatId)) {
            setChatRooms((prevChatRooms)=>{
                const newChatRooms = new Map(prevChatRooms);
                newChatRooms.set(currentChatId, {
                    id: crypto.randomUUID(),
                    chatId: currentChatId,
                    sender: user.email,
                    recipient: currentCompanion
                });
                return newChatRooms;
            });
        }
    };
    if (!user) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: "Loading..."
        }, void 0, false, {
            fileName: "[project]/src/components/ChatPage.tsx",
            lineNumber: 158,
            columnNumber: 16
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-screen bg-black text-gray-300 flex overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                className: "w-1/4 bg-gray-900 p-4 h-screen shadow-lg flex flex-col overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-lg font-semibold text-white mb-4",
                        children: "Chats"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChatPage.tsx",
                        lineNumber: 165,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                        className: "space-y-2 overflow-y-auto flex-1",
                        children: [
                            ...chatRooms.values()
                        ].map((chatRoom)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "w-full bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded transition text-left",
                                    onClick: ()=>selectChat(chatRoom.chatId, user?.email, chatRoom.recipient),
                                    children: chatRoom.recipient
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ChatPage.tsx",
                                    lineNumber: 169,
                                    columnNumber: 29
                                }, this)
                            }, chatRoom.id, false, {
                                fileName: "[project]/src/components/ChatPage.tsx",
                                lineNumber: 168,
                                columnNumber: 25
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChatPage.tsx",
                        lineNumber: 166,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ChatPage.tsx",
                lineNumber: 164,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "flex-1 p-6 flex flex-col h-screen overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-2xl font-bold text-white",
                        children: currentCompanion
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChatPage.tsx",
                        lineNumber: 182,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-full bg-gray-900 p-4 rounded-lg shadow-lg mt-4 flex flex-col flex-1 overflow-hidden",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 overflow-y-auto p-2 space-y-2",
                                children: currentCompanion ? (chatRoomMessages.get(currentChatId) || []).map((chatMessage)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `p-3 rounded max-w-[75%] ${chatMessage.sender === user.email ? "bg-blue-600 text-white ml-auto" : "bg-gray-800 text-gray-300"}`,
                                        children: chatMessage.content
                                    }, chatMessage.id, false, {
                                        fileName: "[project]/src/components/ChatPage.tsx",
                                        lineNumber: 189,
                                        columnNumber: 33
                                    }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-gray-400 flex items-center justify-center h-full",
                                    children: "Select a chat to start messaging"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ChatPage.tsx",
                                    lineNumber: 201,
                                    columnNumber: 29
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/ChatPage.tsx",
                                lineNumber: 186,
                                columnNumber: 21
                            }, this),
                            currentCompanion && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-4 flex p-2 bg-gray-800 rounded-b-lg",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        className: "flex-grow p-2 rounded bg-gray-700 border border-gray-600 text-white",
                                        placeholder: `Enter message for ${currentCompanion}`,
                                        onChange: handleInputMessage,
                                        value: inputMessage,
                                        onKeyDown: (e)=>e.key === 'Enter' && (e.preventDefault(), sendMessage())
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/ChatPage.tsx",
                                        lineNumber: 210,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "ml-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 text-white rounded transition",
                                        onClick: sendMessage,
                                        children: "Send"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/ChatPage.tsx",
                                        lineNumber: 218,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/ChatPage.tsx",
                                lineNumber: 209,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/ChatPage.tsx",
                        lineNumber: 184,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ChatPage.tsx",
                lineNumber: 181,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ChatPage.tsx",
        lineNumber: 162,
        columnNumber: 9
    }, this);
}
_s(ChatPage, "XsNQr8192kg/wULioXvJiBQ4jK0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"]
    ];
});
_c = ChatPage;
var _c;
__turbopack_refresh__.register(_c, "ChatPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/chat/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>LoginPage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ChatPage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/src/components/ChatPage.tsx [app-client] (ecmascript)");
'use client';
;
;
function LoginPage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ChatPage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
        fileName: "[project]/src/app/chat/page.tsx",
        lineNumber: 5,
        columnNumber: 12
    }, this);
}
_c = LoginPage;
var _c;
__turbopack_refresh__.register(_c, "LoginPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/chat/page.tsx [app-rsc] (ecmascript, Next.js server component, client modules)": ((__turbopack_context__) => {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, t: __turbopack_require_real__ } = __turbopack_context__;
{
}}),
}]);

//# sourceMappingURL=src_18fed9._.js.map