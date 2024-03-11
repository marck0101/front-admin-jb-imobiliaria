import { IFocusNFeCteos } from './focus-nfe-cteos';

export interface ICteos {
  _id: string;

  cnpj_emitente: string;
  ref: string;

  status: string;
  status_sefaz: string;
  chave: string;
  numero: string;
  serie: string;
  modelo: string;
  caminho_xml: string;
  caminho_dacte: string;
  mensagem_sefaz: string;

  caminho_xml_carta_correcao?: string;
  requisicao: IFocusNFeCteos;
  protocolo: unknown;

  requisicao_carta_correcao?: unknown;
  protocolo_carta_correcao?: unknown;

  createdAt: string;
  updatedAt: string;
}
