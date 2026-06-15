# Testing Guide - All Fixes

## Prerequisites
- Backend running on port 5000 (or configured port)
- Frontend running on port 3000
- MongoDB connected
- At least one listener account created

---

## Test 1: Dashboard Authentication Guard

### Steps:
1. Open browser in incognito/private mode
2. Navigate directly to `http://localhost:3000/dashboard`

### Expected Result:
✅ Should immediately redirect to `/listener/login`
✅ Should NOT show dashboard UI (even briefly)
✅ Should NOT see any console errors

### What Was Fixed:
- Added auth guard that returns null until token verified
- Prevents rendering before authentication check

---

## Test 2: Listener Tab Switching (Online Status Persistence)

### Steps:
1. Login as listener at `/listener/login`
2. Toggle status to "Online"
3. Watch dashboard logs showing "Connected: [socket-id]"
4. Switch to another browser tab (e.g., open google.com)
5. Wait 3-5 seconds
6. Switch back to dashboard tab

### Expected Result:
✅ Dashboard should show "Disconnected... (reconnecting...)"
✅ Should reconnect within 2-3 seconds
✅ Status should remain "Online" (not flip to offline)
✅ Logs should show disconnect and reconnect events

### What Was Fixed:
- Backend now waits 8 seconds before marking listener offline
- Allows time for reconnection during tab switches
- Socket ID tracking prevents race conditions

---

## Test 3: End-to-End User → Listener Connection

### Setup:
- **Browser 1 (Listener)**: Login and go to dashboard
- **Browser 2 (User)**: Go to landing page

### Steps:

**User Side (Browser 2):**
1. Scroll to "Talk Now" section
2. Select any mood (e.g., "Anxious")
3. Click "Text Chat"
4. Should see "You're in the queue" screen
5. Note the anonymous name (e.g., "CalmRiver42")
6. Click "Enter Chat Room"
7. Should see "Finding a listener..." screen

**Listener Side (Browser 1):**
8. Toggle status to "Online" if not already
9. Wait for user to appear in "Waiting Users" list
10. Should see mood (e.g., "Anxious")
11. Click "Accept" button
12. **Critical**: Listener should immediately navigate to `/chat?role=listener`

**Both Sides:**
13. **Listener** should see: "You are now connected with the user. You can start the conversation."
14. **User** should see: "You are now connected with a listener. Feel free to share."
15. Both should see the chat interface (not waiting/queue screens)

### Expected Result:
✅ Both parties navigate to chat room successfully
✅ No one stuck on "Finding a listener..." screen
✅ Both can see welcome messages
✅ Socket IDs appear in browser console/network tab
✅ Listener status changes to "busy" in database

### What Was Fixed:
- Dashboard doesn't disconnect socket before redirect (prevents premature disconnect)
- Added redirectingRef to prevent duplicate navigation
- Backend join:room handler updates listener status to "busy"
- Both sockets properly join the room before emit
- Chat page connects with proper auth (token for listener, sessionId for user)

---

## Test 4: Sending Messages in Chat

### Prerequisites:
- Complete Test 3 (both parties in chat room)

### Steps:
1. **User** types "Hello, I need to talk" and presses Enter
2. **Listener** should see the message appear instantly
3. **Listener** types "I'm here to listen" and presses Enter
4. **User** should see the message appear instantly
5. Send 3-4 more messages from each side

### Expected Result:
✅ All messages appear for both parties
✅ Messages show correct sender (left vs right alignment)
✅ Timestamps appear on all messages
✅ No "sending..." stuck states
✅ Typing indicators appear (3 bouncing dots)

---

## Test 5: Listener Refresh During Session

### Prerequisites:
- Complete Test 3 (active chat session)

### Steps:
1. **Listener** is in chat room with user
2. **Listener** refreshes the page (F5 or Ctrl+R)
3. Page reloads

### Expected Result:
✅ Listener returns to dashboard (localStorage cleared on refresh)
✅ OR: If we want to maintain session, listener should rejoin chat room
✅ No errors in console
✅ User side should handle gracefully (shows "listener disconnected" or similar)

### Current Behavior:
- Refresh clears localStorage, so listener returns to dashboard
- This is expected behavior for v1.0

---

## Test 6: End Session Flow

### Prerequisites:
- Complete Test 3 (active chat session)

### Steps:
1. **Listener** or **User** clicks "End" button
2. Confirmation modal appears
3. Click "End Session"

### Expected Result:
✅ Both parties navigate to `/post-session`
✅ Listener status returns to "online" (not "busy")
✅ Session marked as "completed" in database
✅ Duration calculated and saved

---

## Test 7: Multiple Listeners Online

### Setup:
- Create 2 listener accounts
- Open 2 browser windows (or different browsers)

### Steps:
1. Login as Listener A in Browser 1
2. Login as Listener B in Browser 2
3. Both toggle status to "Online"
4. User joins queue from landing page
5. **Either** Listener A or Listener B accepts

### Expected Result:
✅ User appears in both dashboards
✅ Whichever listener accepts first gets the user
✅ User disappears from other listener's queue immediately
✅ Accepting listener goes to chat room successfully
✅ Other listener remains on dashboard

---

## Test 8: Rapid Tab Switching (Stress Test)

### Steps:
1. Login as listener, go online
2. Rapidly switch between tabs (1-2 seconds each)
3. Switch back and forth 10 times
4. End on dashboard tab

### Expected Result:
✅ Dashboard reconnects each time
✅ Status remains "Online" throughout
✅ No "offline" status set in database
✅ Connection logs show disconnect/reconnect pairs

---

## Test 9: Network Interruption Recovery

### Steps:
1. Login as listener, go online
2. Open browser DevTools → Network tab
3. Click "Offline" to simulate network loss
4. Wait 5 seconds
5. Disable "Offline" mode

### Expected Result:
✅ Dashboard shows "Disconnected" during offline period
✅ Reconnects automatically when network returns
✅ If < 8 seconds, status stays "online"
✅ If > 8 seconds, status set to "offline"

---

## Test 10: Browser Console Checks

### What to Look For:
✅ **No errors** related to socket.io
✅ **No "Authentication failed"** errors
✅ **No "User no longer in queue"** errors unless expected
✅ Green connection logs in dashboard
✅ Socket connection events in console

### Common Good Logs:
```
Socket connected: xyz123 (listener, listenerId: abc456)
Listener socket mapped: abc456 -> xyz123
Connected! ID: xyz123
Listener rejoined room: session_12345_xyz
Listener abc456 status set to busy
```

---

## Troubleshooting

### Issue: User stuck on "Finding a listener..."
**Check:**
- Is listener status "online" in dashboard?
- Did listener actually click "Accept"?
- Check backend logs for "Session created" message
- Check if roomId and sessionId saved to localStorage

### Issue: Listener marked offline when switching tabs
**Check:**
- Backend disconnect handler has 8-second setTimeout
- Socket ID properly tracked in listenerSockets Map
- No errors in backend logs during disconnect

### Issue: Dashboard accessible without login
**Check:**
- Token exists in localStorage: `localStorage.getItem("opntus_token")`
- Auth guard returning null before authed=true
- Redirect happening immediately

---

## Success Criteria

All tests pass when:
- ✅ No authentication bypasses
- ✅ Tab switching doesn't break listener status
- ✅ User and listener both successfully enter chat room
- ✅ Messages flow bidirectionally
- ✅ Sessions end gracefully
- ✅ No console errors during normal flow
- ✅ Backend logs show proper event sequence

---

**Last Updated**: December 2024  
**Version**: v1.0.1
