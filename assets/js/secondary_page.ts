import { showMessage } from './utils/message_utils';

declare global {
  interface Window { showMessage: (msg: string) => void }
}

window.showMessage = showMessage;
