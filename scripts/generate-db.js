const fs = require('fs');
const path = require('path');

const CSV_PATH = process.argv[2];
if (!CSV_PATH) {
  console.log('Uso: node generate-db.js <caminho-do-csv>');
  console.log('Baixe o CSV de: https://www.kaggle.com/datasets/rovnez/fc-26-fifa-26-player-data');
  process.exit(1);
}

const csv = fs.readFileSync(CSV_PATH, 'utf-8');
const lines = csv.split('\n');
const headers = lines[0].split(',');

const players = [];

for (let i = 1; i < lines.length; i++) {
  const values = lines[i].match(/(".*?"|[^,]+)/g);
  if (!values || values.length < 10) continue;

  const get = (field) => {
    const idx = headers.indexOf(field);
    if (idx === -1) return '';
    return (values[idx] || '').replace(/"/g, '').trim();
  };

  const id = parseInt(get('player_id'));
  if (!id || isNaN(id)) continue;

  const overall = parseInt(get('overall')) || 0;
  const potential = parseInt(get('potential')) || 0;

  const headshotId = id;
  const headshotUrl = `https://cdn.arenavirtual.net/images/jogadores_fifa_26/${headshotId}.png`;

  const stats = {
    pace: parseInt(get('pace')) || 0,
    shooting: parseInt(get('shooting')) || 0,
    passing: parseInt(get('passing')) || 0,
    dribbling: parseInt(get('dribbling')) || 0,
    defending: parseInt(get('defending')) || 0,
    physical: parseInt(get('physic')) || 0,
  };

  const positions = get('player_positions')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

  const workRate = get('work_rate');
  const [workrateAtt = '', workrateDef = ''] = workRate.split('/').map((w) => w.trim());

  const tags = get('player_tags');
  const traits = get('player_traits');
  const playStyles = [...tags.split(','), ...traits.split(',')]
    .map((s) => s.trim())
    .filter((s) => s.length > 1);

  const valueEur = parseInt(get('value_eur')) || 0;
  let value = '';
  if (valueEur >= 1000000) value = `€${(valueEur / 1000000).toFixed(1)}M`;
  else if (valueEur >= 1000) value = `€${(valueEur / 1000).toFixed(0)}K`;
  else if (valueEur > 0) value = `€${valueEur}`;

  const heightCm = parseInt(get('height_cm')) || 0;
  const height = heightCm > 0 ? `${Math.floor(heightCm / 30.48)}'${Math.round((heightCm % 30.48) / 2.54)}"` : '';

  const weightKg = parseInt(get('weight_kg')) || 0;
  const weight = weightKg > 0 ? `${Math.round(weightKg * 2.205)} lbs` : '';

  players.push({
    id,
    name: get('short_name'),
    fullName: get('long_name'),
    positions,
    overall,
    potential,
    age: parseInt(get('age')) || 0,
    height,
    weight,
    foot: get('preferred_foot'),
    weakFoot: parseInt(get('weak_foot')) || 0,
    skillMoves: parseInt(get('skill_moves')) || 0,
    workrateAtt,
    workrateDef,
    club: get('club_name'),
    clubId: parseInt(get('club_team_id')) || 0,
    nationality: get('nationality_name'),
    nationalityId: parseInt(get('nationality_id')) || 0,
    value,
    wage: '',
    releaseClause: '',
    stats,
    playStyles: playStyles.slice(0, 8),
    headshotUrl,
    nationUrl: `https://cdn.arenavirtual.net/images/paises/${get('nationality_id')}.png`,
    teamUrl: `https://cdn.arenavirtual.net/images/escudos/${get('club_team_id')}.png`,
    playerUrl: `https://sofifa.com/player/${id}`,
  });
}

players.sort((a, b) => b.overall - a.overall);

const outPath = path.join(__dirname, '..', 'src', 'lib', 'sofifa', 'players.json');
fs.writeFileSync(outPath, JSON.stringify(players, null, 2));
console.log(`✅ ${players.length} jogadores salvos em ${outPath}`);
