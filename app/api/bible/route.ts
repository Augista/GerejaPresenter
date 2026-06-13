import { NextResponse } from 'next/server';

export const BOOKS = [
  { code: 'MAT', name: 'Matius' },
  { code: 'MRK', name: 'Markus' },
  { code: 'LUK', name: 'Lukas' },
  { code: 'JHN', name: 'Yohanes' },
  { code: 'ACT', name: 'Kisah Para Rasul' },
  { code: 'ROM', name: 'Roma' },
  { code: '1CO', name: '1 Korintus' },
  { code: '2CO', name: '2 Korintus' },
  { code: 'GAL', name: 'Galatia' },
  { code: 'EPH', name: 'Efesus' },
  { code: 'PHP', name: 'Filipi' },
  { code: 'COL', name: 'Kolose' },
  { code: '1TH', name: '1 Tesalonika' },
  { code: '2TH', name: '2 Tesalonika' },
  { code: '1TI', name: '1 Timotius' },
  { code: '2TI', name: '2 Timotius' },
  { code: 'TIT', name: 'Titus' },
  { code: 'PHM', name: 'Filemon' },
  { code: 'HEB', name: 'Ibrani' },
  { code: 'JAS', name: 'Yakobus' },
  { code: '1PE', name: '1 Petrus' },
  { code: '2PE', name: '2 Petrus' },
  { code: '1JN', name: '1 Yohanes' },
  { code: '2JN', name: '2 Yohanes' },
  { code: '3JN', name: '3 Yohanes' },
  { code: 'JUD', name: 'Yudas' },
  { code: 'REV', name: 'Wahyu' },
];

export async function GET() {
  return NextResponse.json(BOOKS);
}
