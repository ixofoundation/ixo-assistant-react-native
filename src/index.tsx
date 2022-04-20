import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

type sockUrl = {
  sockUrl?: any;
  sockOpts?: any;
  initSessionId?: number;
  initMsg?: any;
  onError?: any;
  onUtter?: any;
};

export function useBot({ sockUrl, initMsg, onError, onUtter }: sockUrl) {
  const sockRef = useRef<Socket | null>(null);
  const sessionIdRef = useRef(null);
  const inputRef = useRef({ focus: noop, blur: noop });
  const [userText, setUserText] = useState('');
  const [sessionID, setSessionId] = useState('');
  const [msgHistory, setMsgHistory] = useState<any>([]);

  const pushMsgToHistory = useCallback((msg: any) => {
    setMsgHistory((lastMsgHistory: any) => [...lastMsgHistory, msg]);
  }, []);

  const removeMsgFromHistory = useCallback(
    (msgIdx: number) => {
      setMsgHistory((lastMsgHistory: string | any[]) => [
        ...lastMsgHistory.slice(0, msgIdx),
        ...lastMsgHistory.slice(msgIdx + 1),
      ]);
    },
    [setMsgHistory]
  );

  const userUtter = useCallback(
    (text: any, payload?: any) => {
      if (sockRef.current !== null) {
        sockRef.current.emit('user_uttered', {
          session_id: sessionID,
          message: payload || text,
        });

        const msg = { ts: Date.now(), direction: 'out', text };

        onUtter(msg);
        pushMsgToHistory(msg);
      }
    },
    [onUtter, pushMsgToHistory, sessionID]
    // [sockRef.current, sessionIdRef.current]
  );

  const sendUserText = useCallback(
    (msg) => {
      userUtter(msg);
      setUserText('');
    },
    [userUtter]
  );

  const selectOption = useCallback(
    (msgIdx: number, optIdx: string | number) => {
      const msg = msgHistory[msgIdx],
        opt = (msg.buttons || msg.quick_replies)[optIdx];

      userUtter(opt.title, opt.payload);

      inputRef.current.focus();

      if (msg.quick_replies) removeMsgFromHistory(msgIdx);
    },
    [msgHistory, removeMsgFromHistory, userUtter]
  );

  const handleBotUtter = useCallback(
    (msg: {
      metadata?: any;
      text?: any;
      quick_replies?: any;
      buttons?: any;
    }) => {
      const { text, quick_replies, buttons } = msg,
        msgTpl = {
          ts: Date.now(),
          direction: 'in',
          metadata: msg.metadata,
        };

      onUtter({ ...msgTpl, ...msg });

      if (text) pushMsgToHistory({ ...msgTpl, text });

      if (quick_replies) pushMsgToHistory({ ...msgTpl, quick_replies });

      if (buttons) pushMsgToHistory({ ...msgTpl, buttons });

      if (!text && !quick_replies && !buttons)
        pushMsgToHistory({ ...msgTpl, ...msg });

      if (quick_replies || buttons) inputRef.current.blur();
    },
    [onUtter, pushMsgToHistory]
  );

  useEffect(() => {
    // const [, sockHostname, sockPath] = sockUrl.match(/^((?:http|ws)s?:\/\/[^/]+)(\/.*)$/)

    const sock = io(sockUrl);
    sockRef.current = sock;

    sock.on('connect', () => {
      console.log('connected', sock.io.engine.id);
      if (sessionID !== '') {
        sock.emit('session_request', { sessionID });
      } else {
        setSessionId(sock.io.engine.id);
      }
    });

    socketErrorEventNames.forEach((errorEventName) =>
      sock.on(errorEventName, (e: string) => {
        if (errorEventName === 'disconnect' && e === 'io client disconnect')
          // this is fired on manual disconnects so not an error
          return;
        onError({ type: errorEventName, payload: e });
      })
    );

    sock.on('session_confirm', (sessInfo: { session_id: any }) => {
      sessionIdRef.current = sessInfo.session_id;
      setMsgHistory([]);
      inputRef.current.focus();

      if (initMsg)
        if (typeof initMsg === 'object')
          userUtter(initMsg.title, initMsg.payload);
        else userUtter(initMsg);
    });

    sock.on('bot_uttered', handleBotUtter);

    return () => {
      sock.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    msgHistory,
    onInputRef: (el: any) => {
      inputRef.current = el;
    },
    userText,
    setUserText,
    sendUserText,
    selectOption,
    botUtter: handleBotUtter,
  };
}

const noop = () => null;

const socketErrorEventNames = [
  'error',
  'connect_error',
  'connect_timeout',
  'reconnect_error',
  'reconnect_failed',
  'disconnect',
];
