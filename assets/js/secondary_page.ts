import { showMessage } from './message_utils';

declare global {
  interface Window { showMessage: (msg: string) => void }
}

window.showMessage = showMessage;
