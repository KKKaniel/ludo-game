// 惩罚内容，按难易分级均匀分布在外圈 25 格中
// 局号对应 ringPos（0~24）的绝对坐标（absPos）
// null = 普通格，不触发惩罚

export type PenaltyLevel = 'mild' | 'medium' | 'spicy'

export interface Penalty {
  text: string
  level: PenaltyLevel
}

// 键为 absPos (0~24)
export const PENALTIES: Record<number, Penalty> = {
  // —— 轻度 mild ——
  1:  { level: 'mild',   text: '被对方挖痒 60秒' },
  3:  { level: 'mild',   text: '给对方按摩 2 分钟' },
  5:  { level: 'mild',   text: '帮对方做头部按摩' },
  7:  { level: 'mild',   text: '帮对方抜掖鼻屎' },
  9:  { level: 'mild',   text: '帮对方洗澡一次' },

  // —— 中度 medium ——
  11: { level: 'medium', text: '升着内裤扭 30 秒' },
  13: { level: 'medium', text: '被对方骡在身上打人' },
  15: { level: 'medium', text: '十指相扣互相对视，先笑的人被对方捍绑' },
  17: { level: 'medium', text: '被对方亲 2 分钟，回亲就要跪下说“主人请狠狠爱我吧” 5 遍' },
  19: { level: 'medium', text: '被对方鸞子抽打 20 下，挂一下向主人求饶一次' },

  // —— 重度 spicy ——
  21: { level: 'spicy',  text: '被对方和道具玩弄 5 分钟' },
  22: { level: 'spicy',  text: '自慰 5 分钟' },
  23: { level: 'spicy',  text: '乳夹夸在胸上一把拉掉' },
  24: { level: 'spicy',  text: '屌尼巳一个地方被对方舌舌和和和' },
}

// 颜色映射
export const LEVEL_COLOR: Record<PenaltyLevel, string> = {
  mild:   'rgba(46,204,113,0.35)',
  medium: 'rgba(241,196,15,0.35)',
  spicy:  'rgba(231,76,60,0.45)',
}
export const LEVEL_STROKE: Record<PenaltyLevel, string> = {
  mild:   '#2ecc71',
  medium: '#f1c40f',
  spicy:  '#e74c3c',
}
export const LEVEL_EMOJI: Record<PenaltyLevel, string> = {
  mild:   '🟢',
  medium: '🟡',
  spicy:  '🔴',
}
