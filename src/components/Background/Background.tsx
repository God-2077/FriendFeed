import type { FC } from 'react';

/**
 * 背景装饰组件
 * 包含浮动形状和星星背景动画效果
 */
const Background: FC = () => {
  return (
    <div className="background-decorations">
      <div className="floating-shape shape-1" />
      <div className="floating-shape shape-2" />
      <div className="floating-shape shape-3" />
    </div>
  );
};

export default Background;
