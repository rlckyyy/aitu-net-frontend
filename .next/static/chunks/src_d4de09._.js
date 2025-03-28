(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["static/chunks/src_d4de09._.js", {

"[project]/src/models/friend/FriendRequestStatus.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "FriendRequestStatus": (()=>FriendRequestStatus)
});
var FriendRequestStatus = /*#__PURE__*/ function(FriendRequestStatus) {
    FriendRequestStatus["PENDING"] = "PENDING";
    FriendRequestStatus["ACCEPTED"] = "ACCEPTED";
    FriendRequestStatus["DECLINED"] = "DECLINED";
    return FriendRequestStatus;
}({});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/friends/respond-requests/ReceivedRequests.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>ReceivedRequests)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/src/context/AuthProvider.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$friendsApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/src/lib/friendsApi.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$friend$2f$FriendRequestStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/src/models/friend/FriendRequestStatus.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/src/lib/index.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
;
var _s = __turbopack_refresh__.signature();
'use client';
;
;
;
;
;
;
function ReceivedRequests() {
    _s();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const [friendRequests, setFriendRequests] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ReceivedRequests.useEffect": ()=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$friendsApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["friendsApi"].getReceivedFriendRequests(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$friend$2f$FriendRequestStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FriendRequestStatus"].PENDING).then({
                "ReceivedRequests.useEffect": (response)=>setFriendRequests(response.data)
            }["ReceivedRequests.useEffect"]).catch({
                "ReceivedRequests.useEffect": (error)=>console.error("Error while getting friends:", error)
            }["ReceivedRequests.useEffect"]).finally({
                "ReceivedRequests.useEffect": ()=>setLoading(false)
            }["ReceivedRequests.useEffect"]);
        }
    }["ReceivedRequests.useEffect"], [
        user
    ]);
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            children: "Loading ..."
        }, void 0, false, {
            fileName: "[project]/src/components/friends/respond-requests/ReceivedRequests.tsx",
            lineNumber: 23,
            columnNumber: 16
        }, this);
    }
    const handleAcceptRequest = (requestId)=>{
        try {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].friends.respondRequest(requestId, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$friend$2f$FriendRequestStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FriendRequestStatus"].ACCEPTED);
            setFriendRequests((prev)=>prev.filter((request)=>request.id !== requestId));
        } catch (error) {
            console.error("Ошибка при принятии запроса:", error);
        }
    };
    const handleDeclineRequest = (requestId)=>{
        try {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].friends.respondRequest(requestId, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$friend$2f$FriendRequestStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FriendRequestStatus"].DECLINED);
            setFriendRequests((prev)=>prev.filter((request)=>request.id !== requestId));
        } catch (error) {
            console.error("Ошибка при отклонении запроса:", error);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                children: "Received Friend Requests"
            }, void 0, false, {
                fileName: "[project]/src/components/friends/respond-requests/ReceivedRequests.tsx",
                lineNumber: 43,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                style: {
                    listStyle: "none",
                    padding: 0
                },
                children: friendRequests.length > 0 ? friendRequests.map((friendReq)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        style: {
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px",
                            borderBottom: "1px solid #ddd"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: {
                                    pathname: "/users/profile/another",
                                    query: {
                                        userId: friendReq.senderId
                                    }
                                },
                                style: {
                                    textDecoration: "none",
                                    color: "blue",
                                    fontWeight: "bold",
                                    cursor: "pointer"
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: friendReq.sender
                                }, void 0, false, {
                                    fileName: "[project]/src/components/friends/respond-requests/ReceivedRequests.tsx",
                                    lineNumber: 69,
                                    columnNumber: 33
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/friends/respond-requests/ReceivedRequests.tsx",
                                lineNumber: 57,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>handleDeclineRequest(friendReq.id),
                                style: {
                                    backgroundColor: "red",
                                    color: "white",
                                    border: "none",
                                    padding: "8px 12px",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    transition: "0.3s"
                                },
                                onMouseOver: (e)=>e.currentTarget.style.backgroundColor = "#45a049",
                                onMouseOut: (e)=>e.currentTarget.style.backgroundColor = "#4CAF50",
                                children: "Decline"
                            }, void 0, false, {
                                fileName: "[project]/src/components/friends/respond-requests/ReceivedRequests.tsx",
                                lineNumber: 71,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>handleAcceptRequest(friendReq.id),
                                style: {
                                    backgroundColor: "#4CAF50",
                                    color: "white",
                                    border: "none",
                                    padding: "8px 12px",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    transition: "0.3s"
                                },
                                onMouseOver: (e)=>e.currentTarget.style.backgroundColor = "#45a049",
                                onMouseOut: (e)=>e.currentTarget.style.backgroundColor = "#4CAF50",
                                children: "Accept"
                            }, void 0, false, {
                                fileName: "[project]/src/components/friends/respond-requests/ReceivedRequests.tsx",
                                lineNumber: 91,
                                columnNumber: 29
                            }, this)
                        ]
                    }, friendReq.sender, true, {
                        fileName: "[project]/src/components/friends/respond-requests/ReceivedRequests.tsx",
                        lineNumber: 47,
                        columnNumber: 25
                    }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    children: "No received friend requests"
                }, void 0, false, {
                    fileName: "[project]/src/components/friends/respond-requests/ReceivedRequests.tsx",
                    lineNumber: 114,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/friends/respond-requests/ReceivedRequests.tsx",
                lineNumber: 44,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/friends/respond-requests/ReceivedRequests.tsx",
        lineNumber: 42,
        columnNumber: 9
    }, this);
}
_s(ReceivedRequests, "zJg236SBeqQXpKlUEhQEOsUfUsw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = ReceivedRequests;
var _c;
__turbopack_refresh__.register(_c, "ReceivedRequests");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/friends/respond-requests/page.tsx [app-rsc] (ecmascript, Next.js server component, client modules)": ((__turbopack_context__) => {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, t: __turbopack_require_real__ } = __turbopack_context__;
{
}}),
}]);

//# sourceMappingURL=src_d4de09._.js.map