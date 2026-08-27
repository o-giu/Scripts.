(() => {
  // Verifica se o script já está em execução e para a versão antiga antes de iniciar uma nova.
  if (window.autoEmojiSender) {
    clearTimeout(window.autoEmojiSender);
    console.log('Parando o script antigo e iniciando um novo.');
  }

  // Lista de emojis que podem ser enviados.
  const emojis = ['😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', '😋', '😎', '😍', '😘', '😗', '😙', '😚', '🙂', '🤗', '🤔', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '😴', '😌', '😛', '😜', '😝', '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '☹️', '🙁', '😖', '😞', '😟', '😤', '😢', '😭', '😦', '😧', '😨', '😩', '😬', '😰', '😱', '😳', '😵', '😡', '😠', '😇', '🤠', '🤡', '🤥', '🤓', '😈', '👿', '👹', '👺', '💀', '👻', '👽', '🤖', '💩', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🙈', '🙉', '🙊', '💌', '💘', '💝', '💖', '💗', '💓', '💞', '💕', '💟', '❣️', '💔', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💣', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '💤', '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦵', '🦶', '👂', '👃', '🧠', '🦷', '🦴', '👀', '👁️', '👅', '👄', '👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '👨‍🦰', '👨‍🦱', '👨‍🦳', '👨‍🦲', '👩', '👩‍🦰', '👩‍🦱', '👩‍🦳', '👩‍🦲', '🧓', '👴', '👵', '🙍', '🙎', '🙅', '🙆', '💁', '🙋', '🙇', '🤦', '🤷', '👮', '🕵️', '💂', '👷', '🤴', '👸', '👳', '👲', '🧕', '🤵', '👰', '🤰', '🤱', '👼', '🎅', '🤶', '🦸', '🦹', '🧙', '🧚', '🧛', '🧜', '🧝', '🧞', '🧟', '🧠', '🧡', '🧢', '🎓', '⛑️', '🎒', '🧳', '👓', '🕶️', '🥽', '🥼', '🦺', '👔', '👕', '👖', '🧣', '🧤', '🧥', '🧦', '👗', '👘', '🥻', '🩱', '🩲', '🩳', '👙', '👚', '👛', '👜', '👝', '🎒', '👞', '👟', '🥾', '🥿', '👠', '👡', '🩰', '👢', '👑', '👒', '🎩', '🎓', '🧢', '⛑️', '📿', '💄', '💍', '💼'];
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

  const getRandomEmoji = () => {
    // 1 envia apenas um emoji
    return emojis[rand(0, emojis.length - 1)];
  };

  const sendMessage = (emoji) => {
    // Localiza o iframe do chat e a caixa de texto para inserir o emoji.
    const liveChatFrame = document.querySelector('iframe.style-scope.ytd-live-chat-frame');
    if (!liveChatFrame) return;

    const chatInputBox = liveChatFrame.contentWindow.document.querySelector('div#input[contenteditable=""]');
    if (!chatInputBox) return;

    chatInputBox.focus();
    chatInputBox.innerText = emoji;
    // Dispara um evento de input para que a página do YouTube reconheça a alteração.
    chatInputBox.dispatchEvent(new Event('input', { bubbles: true }));

    // Aguarda um momento antes de clicar para garantir que o botão de enviar esteja habilitado.
    setTimeout(() => {
      const sendButton = liveChatFrame.contentWindow.document.querySelector('#send-button button');
      if (!sendButton || sendButton.disabled) return;
      sendButton.click();
    }, 1000);
  };

  const autoSendEmoji = () => {
    sendMessage(getRandomEmoji());
    // Agenda o próximo envio para um tempo aleatório entre 10 e 15 minutos.
    const delay = rand(10, 15) * 60 * 1000;
    console.log(`Próximo envio em ${delay / 1000 / 60} minutos`);
    // Armazena o ID do timer para que ele possa ser parado se o script for reiniciado.
    window.autoEmojiSender = setTimeout(autoSendEmoji, delay);
  };

  console.log('Iniciando envio automático (Modo Universal Iframe)...');
  // Inicia o ciclo de envio de emojis.
  autoSendEmoji();
})();
