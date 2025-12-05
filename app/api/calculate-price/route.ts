import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Configuration pour Vercel: durée maximale d'exécution (30 secondes)
export const maxDuration = 30;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startDate, endDate, startTime, endTime, vehicleType } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Les dates de début et de fin sont requises' },
        { status: 400 }
      );
    }

    console.log('=== CALCUL DU PRIX ===');
    console.log('Dates:', { startDate, endDate, startTime, endTime, vehicleType });

    // Calculer la durée en jours
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    // Déterminer la saison
    const month = start.getMonth() + 1; // 1-12
    let season = 'basse';
    if (month >= 6 && month <= 8) {
      season = 'haute'; // Été
    } else if (month === 12 || month <= 2) {
      season = 'moyenne'; // Hiver (sauf Noël)
    }

    // Appeler OpenAI pour calculer le prix
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Tu es un expert en tarification de location de véhicules. 
          Tu connais les prix pratiqués sur les plateformes Turo, Getaround et autres services de location peer-to-peer en France.
          
          Calcule un prix de location juste en tenant compte de :
          - La durée de location (${diffDays} jour(s))
          - La saison (${season})
          - Le type de véhicule si spécifié (${vehicleType || 'non spécifié'})
          - Les prix du marché actuel sur Turo et Getaround
          - Les pratiques de l'industrie
          
          Réponds UNIQUEMENT en JSON avec cette structure :
          {
            "price": number (prix en centimes d'euros, ex: 11000 pour 110€),
            "pricePerDay": number (prix par jour en centimes),
            "days": number,
            "season": string,
            "explanation": string (explication courte du calcul),
            "marketComparison": string (comparaison avec le marché)
          }`,
        },
        {
          role: 'user',
          content: `Calcule le prix de location pour une période du ${startDate} au ${endDate} (${diffDays} jour(s)). 
          Saison: ${season}. 
          Type de véhicule: ${vehicleType || 'standard'}.`,
        },
      ],
      max_tokens: 500,
      response_format: { type: 'json_object' },
      temperature: 0.3, // Plus déterministe pour les prix
    });

    const pricing = JSON.parse(response.choices[0].message.content || '{}');

    console.log('=== PRIX CALCULÉ ===');
    console.log(JSON.stringify(pricing, null, 2));

    // Valider que le prix est raisonnable (minimum 50€, maximum 500€ par jour)
    const priceInCents = pricing.price || 11000; // Par défaut 110€
    const minPrice = 5000; // 50€ minimum
    const maxPricePerDay = 50000; // 500€ par jour maximum
    const maxTotalPrice = maxPricePerDay * diffDays;

    const finalPrice = Math.max(minPrice, Math.min(priceInCents, maxTotalPrice));

    return NextResponse.json({
      success: true,
      price: finalPrice,
      pricePerDay: pricing.pricePerDay || Math.round(finalPrice / diffDays),
      days: diffDays,
      season: pricing.season || season,
      explanation: pricing.explanation || 'Prix calculé selon les tarifs du marché',
      marketComparison: pricing.marketComparison || '',
    });
  } catch (error: any) {
    console.error('Erreur lors du calcul du prix:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors du calcul du prix',
        // Prix par défaut en cas d'erreur
        price: 11000,
        days: 1,
      },
      { status: 500 }
    );
  }
}

