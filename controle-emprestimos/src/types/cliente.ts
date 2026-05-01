


export type Cliente = {
  id: string;       // identificador único, gerado automaticamente
  nome: string;     // nome do cliente
  juros: number;    // taxa de juros em %
  travado: boolean; // se está bloqueado para edição
  telefone?: string;  // ← novo! o "?" significa que é opcional
  endereco?: string;  // ← novo! também opcional
};