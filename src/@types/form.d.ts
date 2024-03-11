export declare namespace IForm {
  export type TipoServico = '6' | '7' | '8';

  export interface FirstStep {
    cfop: string;
    valor_total: number;
    valor_receber: number;
    natureza_operacao: string;
    descricao_servico: string;
    tipo_servico: TipoServico;
  }

  export interface SecondStep {
    codigo_municipio_fim: string;
    codigo_municipio_inicio: string;
    municipio_fim: string;
    municipio_inicio: string;
    uf_fim: string;
    uf_inicio: string;
    modal_rodoviario: string;
    observacoes: string;
    seguros_carga?: Array<object>;
    percursos: Array<{
      uf_percurso_veiculo: string;
    }>;
  }

  export type IndicadorInscricaoEstadualTomador = '1' | '2' | '9';

  export interface ThirdyStep {
    cep_tomador: string;
    bairro_tomador: string;
    logradouro_tomador: string;
    numero_tomador: string;
    codigo_municipio_tomador: string;
    municipio_tomador: string;
    uf_tomador: string;
    nome_tomador: string;
    nome_fantasia_tomador: string;
    email_tomador: string;
    pais_tomador: 'Brasil';
    telefone_tomador: string;
    indicador_inscricao_estadual_tomador: IndicadorInscricaoEstadualTomador;
    inscricao_estadual_tomador?: string;
  }
}
