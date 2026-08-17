// conversationController.js
export const updateConversationContext = (message, context) => {
    // For example, if the user talks about an event
    if (/event/i.test(message)) {
      context.lastInteraction = 'event';
    }
    return context;
  };
  