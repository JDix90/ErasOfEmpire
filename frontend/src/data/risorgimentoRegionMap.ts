/**
 * Italian Unification (Risorgimento) — Natural Earth ne_10m admin-1 provinces merged into territories.
 * Keys are `iso_3166_2` from Natural Earth (IT-XX, SM-XX, VA-X01~ for Vatican City).
 * Modern provincial boundaries; historical names are thematic (see map description).
 */

export const RISORGIMENTO_TERRITORY_PARTS: Record<string, string[]> = {
  /** Piedmont, Aosta Valley, Liguria */
  ris_piemonte_liguria: [
    'IT-AL', 'IT-AT', 'IT-BI', 'IT-CN', 'IT-NO', 'IT-TO', 'IT-VB', 'IT-VC',
    'IT-AO',
    'IT-GE', 'IT-IM', 'IT-SP', 'IT-SV',
  ],
  ris_sardegna: ['IT-CA', 'IT-CI', 'IT-OG', 'IT-OR', 'IT-OT', 'IT-SS', 'IT-VS', 'IT-NU'],
  ris_lombardia: ['IT-BG', 'IT-BS', 'IT-CO', 'IT-CR', 'IT-LC', 'IT-LO', 'IT-MN', 'IT-MB', 'IT-MI', 'IT-PV', 'IT-SO', 'IT-VA'],
  /** Veneto (7 provinces) + Friuli-Venezia Giulia (4 provinces) */
  ris_veneto_friuli: [
    'IT-BL', 'IT-PD', 'IT-RO', 'IT-TV', 'IT-VE', 'IT-VI', 'IT-VR',
    'IT-GO', 'IT-PN', 'IT-TS', 'IT-UD',
  ],
  ris_trentino: ['IT-BZ', 'IT-TN'],
  /** Emilia-Romagna + San Marino (9 castelli) */
  ris_emilia: [
    'IT-BO', 'IT-FC', 'IT-FE', 'IT-MO', 'IT-PC', 'IT-PR', 'IT-RA', 'IT-RE', 'IT-RN',
    'SM-01', 'SM-02', 'SM-03', 'SM-04', 'SM-05', 'SM-06', 'SM-07', 'SM-08', 'SM-09',
  ],
  ris_toscana: ['IT-AR', 'IT-FI', 'IT-GR', 'IT-LI', 'IT-LU', 'IT-MS', 'IT-PI', 'IT-PO', 'IT-PT', 'IT-SI'],
  ris_marche_umbria: ['IT-AN', 'IT-AP', 'IT-FM', 'IT-MC', 'IT-PU', 'IT-PG', 'IT-TR'],
  /** Lazio + Vatican City (NE polygon) */
  ris_lazio: ['IT-FR', 'IT-LT', 'IT-RM', 'IT-RI', 'IT-VT', 'VA-X01~'],
  ris_abruzzo_molise: ['IT-AQ', 'IT-CH', 'IT-PE', 'IT-TE', 'IT-CB', 'IT-IS'],
  ris_campania: ['IT-AV', 'IT-BN', 'IT-CE', 'IT-NA', 'IT-SA'],
  ris_puglia: ['IT-BA', 'IT-BR', 'IT-BT', 'IT-FG', 'IT-LE', 'IT-TA'],
  ris_sud: ['IT-MT', 'IT-PZ', 'IT-CS', 'IT-CZ', 'IT-KR', 'IT-RC', 'IT-VV'],
  ris_sicilia: ['IT-AG', 'IT-CL', 'IT-CT', 'IT-EN', 'IT-ME', 'IT-PA', 'IT-RG', 'IT-SR', 'IT-TP'],
};
