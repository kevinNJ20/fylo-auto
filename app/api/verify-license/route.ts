import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Configuration pour Vercel: durée maximale d'exécution (30 secondes)
export const maxDuration = 30;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const licenseFileRecto = formData.get('licenseFileRecto') as File | null;
    const licenseFileVerso = formData.get('licenseFileVerso') as File | null;

    if (!licenseFileRecto || !licenseFileVerso) {
      return NextResponse.json(
        { error: 'Les deux faces du permis (recto et verso) sont requises' },
        { status: 400 }
      );
    }

    console.log('=== VÉRIFICATION DES PERMIS ===');
    console.log('Recto:', licenseFileRecto.name, licenseFileRecto.size, 'bytes');
    console.log('Verso:', licenseFileVerso.name, licenseFileVerso.size, 'bytes');

    // Convertir les fichiers en base64 pour OpenAI Vision
    const rectoArrayBuffer = await licenseFileRecto.arrayBuffer();
    const rectoBuffer = Buffer.from(rectoArrayBuffer);
    const rectoBase64 = rectoBuffer.toString('base64');
    const rectoMimeType = licenseFileRecto.type || 'image/jpeg';

    const versoArrayBuffer = await licenseFileVerso.arrayBuffer();
    const versoBuffer = Buffer.from(versoArrayBuffer);
    const versoBase64 = versoBuffer.toString('base64');
    const versoMimeType = licenseFileVerso.type || 'image/jpeg';

    // Appeler OpenAI Vision API pour analyser les deux images
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Tu es un expert en vérification de permis de conduire. 
          Analyse les deux faces (recto et verso) d'un permis de conduire et vérifie :
          1. Si les images sont bien des permis de conduire (recto et verso)
          2. Si les informations sont lisibles et cohérentes
          3. Si le permis n'est pas expiré
          4. Si le permis semble authentique (pas de signes évidents de falsification)
          5. Si les deux faces correspondent au même permis
          
          Réponds en JSON avec cette structure :
          {
            "isValid": boolean,
            "isLicense": boolean,
            "isReadable": boolean,
            "isExpired": boolean,
            "isAuthentic": boolean,
            "facesMatch": boolean,
            "issues": string[],
            "extractedInfo": {
              "licenseNumber": string | null,
              "expiryDate": string | null,
              "country": string | null
            },
            "recommendation": string
          }`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyse le recto (face avant) et le verso (face arrière) de ce permis de conduire. Vérifie l\'authenticité, la validité et la cohérence des informations.',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${rectoMimeType};base64,${rectoBase64}`,
              },
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${versoMimeType};base64,${versoBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');

    console.log('=== RÉSULTAT DE L\'ANALYSE ===');
    console.log(JSON.stringify(analysis, null, 2));

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('Erreur lors de la vérification du permis:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la vérification du permis',
      },
      { status: 500 }
    );
  }
}

