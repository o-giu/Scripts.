(() => {
  // Verifica se o script já está em execução e para a versão antiga antes de iniciar uma nova.
  if (window.autoKickEmoteSender) {
    clearTimeout(window.autoKickEmoteSender);
    console.log('Parando o script de emote antigo e iniciando um novo.');
  }

  // Função para gerar um número aleatório
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

  // Função principal para enviar um emote
  const sendQuickEmote = () => {
    console.log("Procurando um emote rápido para enviar...");

    // 1. Seleciona todos os botões de emote disponíveis
    const emoteButtons = document.querySelectorAll('#quick-emotes-holder button');

    if (emoteButtons.length === 0) {
      console.error('Nenhum botão de "quick emote" foi encontrado.');
      return;
    }

    // 2. Escolhe 1 emote aleatório para clicar
    const randomIndex = rand(0, emoteButtons.length - 1);
    const emoteToClick = emoteButtons[randomIndex];
    
    // 3. Clica no botão de emote selecionado
    const emoteName = emoteToClick.querySelector('img')?.alt || 'emote desconhecido';
    console.log(`Clicando no emote: ${emoteName}`);
    emoteToClick.click();

    // 4. Aguarda um curto período e depois envia a mensagem
    setTimeout(() => {
      const sendButton = document.querySelector('#send-message-button');
      if (!sendButton) {
        console.error('Botão de envio não encontrado.');
        return;
      }

      if (sendButton.disabled) {
        console.error('O botão de envio está desabilitado.');
        return;
      }
      
      console.log('Clicando no botão "Chat" para enviar.');
      sendButton.click();
    }, 500); // Meio segundo de espera
  };

  // Função para automatizar o envio em intervalos de tempo
  const autoSend = () => {
    sendQuickEmote(); // Envia o emote

    const delay = rand(10, 15) * 60 * 1000; // Define o tempo para o próximo envio
    console.log(`Próximo envio de emote em ${delay / 1000 / 60} minutos.`);
    
    // Armazena o ID do timer na variável global para que ele possa ser parado.
    window.autoKickEmoteSender = setTimeout(autoSend, delay); // Agenda o próximo envio
  };

  // Inicia o processo
  console.log('Iniciando o script de envio automático de emote para a Kick.');
  autoSend();
})();
