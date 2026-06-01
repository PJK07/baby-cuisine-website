
  # Baby Cuisine Website Design (Copy)

  This is a code bundle for Baby Cuisine Website Design (Copy). The original project is available at https://www.figma.com/design/IPDABm2hJ456fZ3pZv9qjI/Baby-Cuisine-Website-Design--Copy-.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Chef Sophie Telegram bot

  Add these values to `.env`:

  ```bash
  TELEGRAM_BOT_TOKEN=your_telegram_bot_token
  ELEVENLABS_API_KEY=your_elevenlabs_api_key
  ELEVENLABS_AGENT_ID=agent_9001kshhvbjcfhp8qmxcheks3ajx
  WEBSITE_URL=https://your-live-website.com/
  ```

  Then run:

  ```bash
  npm run telegram:sophie
  ```

  The Telegram bot uses the same ElevenLabs Chef Sophie agent in text-only mode. Website cart tools are handled safely by telling the customer to complete the order on the website.
  
