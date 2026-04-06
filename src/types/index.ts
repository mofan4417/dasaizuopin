export interface ServiceObject {
  id: string;
  code: string;
  type: 'elderly' | 'child';
  age: number;
  village: string;
  situation: string;
  needs: string;
  status: 'pending' | 'claimed' | 'completed';
}
