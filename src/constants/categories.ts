export type CategoryItem = {
  id: string;
  nome: string;
  icone: string;
  ativa: boolean;
};

const categories: CategoryItem[] = [
  { id: 'cat01', nome: 'Pedreiro', icone: 'hammer', ativa: true },
  { id: 'cat02', nome: 'Encanador', icone: 'droplet', ativa: true },
  { id: 'cat03', nome: 'Eletricista', icone: 'bolt', ativa: true },
  { id: 'cat04', nome: 'Marceneiro', icone: 'wood', ativa: true },
  { id: 'cat05', nome: 'Pintor', icone: 'palette', ativa: true },
  { id: 'cat06', nome: 'Jardineiro', icone: 'leaf', ativa: true },
  { id: 'cat07', nome: 'Montador', icone: 'wrench', ativa: true },
  { id: 'cat08', nome: 'Ar-Condicionado', icone: 'snowflake', ativa: true },
];

export default categories;
