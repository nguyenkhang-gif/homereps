/* =====================================================================
   THƯ VIỆN BÀI TẬP — nơi duy nhất khai báo mọi bài tập của app.

   Thêm bài mới: copy một khối trong EXERCISES, đổi khoá (id, không dấu,
   không khoảng trắng) rồi điền các trường:
     group  : id nhóm trong EXERCISE_GROUPS
     vi, en : tên tiếng Việt / tiếng Anh
     m      : nhóm cơ (chuỗi hiển thị)
     sec    : số giây ước tính cho 1 rep (dùng để tính thời lượng buổi)
     dose   : liều mặc định khi thêm bài [số lượng, đơn vị]
              đơn vị: 'r' rep · 'b' rep/bên · 's' giây · 'sb' giây/bên
     steps  : các bước thực hiện
     tip    : lưu ý / lỗi hay gặp
     anim   : animation (tuỳ chọn — thiếu thì app dùng tạm hình squat)
              { keys: [[tư thế, giây chuyển, giây giữ], ...],
                reps: số rep mỗi vòng | hold: true (bài giữ tư thế),
                front: true (nhìn chính diện), props: [{box:[x,y,w]} | {wall:x}] }

   Tư thế: P([hôngX, hôngY], gócThân, [tayGần, tayXa], [chânGần, chânXa], {n, fp})
   Khung vẽ 200×150, sàn ở y=128, đứng thẳng: hông y=66, cổ chân y=125.
   Nhìn ngang mặt quay sang phải; nằm sấp đầu bên phải; nằm ngửa đầu bên trái.
   ===================================================================== */

const EXERCISE_GROUPS = [
  { id: 'legs', vi: 'Chân · Mông' },
  { id: 'push', vi: 'Đẩy · Ngực · Vai' },
  { id: 'back', vi: 'Lưng' },
  { id: 'core', vi: 'Core · Bụng' },
  { id: 'cardio', vi: 'Tim mạch' }
];

const EXERCISES = (function () {
  /* ---- Tư thế dùng chung cho nhiều bài ---- */
  const onHips = (h) => [[h[0] + 9, h[1] - 3], [h[0] + 7, h[1] - 3]];

  function knees(lift, hip, swing) {
    const up = (kx) => [kx, hip + (lift ? 31 : 44)];
    const fw = [123, hip - 37], bk = [104, hip - 8];
    const A = P([100, hip], -88, [bk, fw], [up(100 + (lift ? 30 : 22)), [101, 125]]);
    const B = P([100, hip], -88, [fw, bk], [[101, 125], up(100 + (lift ? 30 : 22))]);
    const M = P([100, hip + 1], -89, [[101, hip - 12], [101, hip - 12]], [[101, 125], [100, 125]]);
    return [[A, swing, .02], [M, swing, 0], [B, swing, .02], [M, swing, 0]];
  }

  function pushKeys(px, py, leg, topY, botY, handDx, ankle) {
    const T = prone(px, py, leg, topY), B = prone(px, py, leg, botY);
    const hx = T.sh[0] + handDx;
    const hands = [[hx, 124], [hx, 124]];
    const ft = ankle ? [ankle, ankle] : [[px, py], [px, py]];
    return [[P(T.h, T.t, hands, ft), .9, .25], [P(B.h, B.t, hands, ft), .8, .1]];
  }

  function sidePlank(hy) {
    const u = [Math.cos(-22 * D2R), Math.sin(-22 * D2R)], pp = [-u[1], u[0]], h = [92, hy];
    const sh = [h[0] + L.T * u[0], h[1] + L.T * u[1]];
    const upS = [sh[0] - L.SW * pp[0], sh[1] - L.SW * pp[1]], loS = [sh[0] + L.SW * pp[0], sh[1] + L.SW * pp[1]];
    const ank = k => [h[0] + k * L.HW * pp[0] - 59.5 * u[0], h[1] + k * L.HW * pp[1] - 59.5 * u[1]];
    return P(h, -22, [[upS[0] + 2, upS[1] - 42], [loS[0] + 20, 124]], [ank(-1), ank(1)]);
  }

  // Single-leg bridge: free leg continues the shoulder→hip line
  function freeLeg(p, extra) {
    const s = solve(p, false), a = Math.atan2(p.h[1] - s.sh[1], p.h[0] - s.sh[0]) + (extra || 0) * D2R;
    return [p.h[0] + 59 * Math.cos(a), p.h[1] + 59 * Math.sin(a)];
  }

  const sqUp = P([96, 66], -90, [[101, 106], [99, 106]], [[100, 125], [98, 125]]);
  const sqDn = P([78, 97], -52, [[142, 62], [142, 62]], [[100, 125], [98, 125]], { n: -10 });

  const pl1 = prone(40, 119, 60, 102), pl2 = prone(40, 119, 60, 101);
  const plHands = [[pl1.sh[0] + 20, 124], [pl1.sh[0] + 20, 124]];

  const bdBase = (ha, hb, la, lb) => P([80, 94], -14, [ha, hb], [la, lb]);
  const kneeFoot = [51, 124];

  const brDn = P([94, 122], 180, [[98, 124], [98, 124]], [[121, 125], [121, 125]]);
  const brUp = P([96, 97], 150, [[100, 124], [100, 124]], [[121, 125], [121, 125]], { n: 28 });
  const sbDn = P([94, 122], 180, [[98, 124], [98, 124]], [[121, 125], [138, 84]]);
  const sbUp = P([96, 97], 150, [[100, 124], [100, 124]], [[121, 125], [0, 0]], { n: 28 });
  sbUp.l[1] = freeLeg(sbUp, -8);

  const mcT = prone(40, 119, 60, 82);
  const mcH = [[mcT.sh[0], 124], [mcT.sh[0], 124]];
  const mc = (near) => P(mcT.h, mcT.t, mcH, near ? [[120, 114], [40, 119]] : [[40, 119], [120, 114]]);

  const pT = prone(30, 119, 60, 82), pB = prone(30, 119, 60, 110);
  const handsB = [[pT.sh[0], 124], [pT.sh[0], 124]];
  const bStand = P([100, 66], -90, [[103, 107], [101, 107]], [[100, 125], [98, 125]]);
  const bSquat = P([88, 100], -32, handsB, [[100, 125], [98, 125]], { n: 20 });
  const bPlank = P(pT.h, pT.t, handsB, [[30, 119], [30, 119]]);
  const bLow = P(pB.h, pB.t, handsB, [[30, 119], [30, 119]]);
  const bAir = P([100, 56], -90, [[128, -12], [126, -12]], [[101, 112], [99, 112]], { fp: [45, 45] });

  const supineArms = [[89, 123], [89, 123]];

  /* ---- Danh sách bài tập ---- */
  return {
    /* ===== Chân · Mông ===== */
    squat: {
      group: 'legs', vi: 'Squat', en: 'Bodyweight Squat', m: 'Đùi trước · Mông', sec: 2.5, dose: [10, 'r'],
      steps: ['Chân rộng bằng vai, mũi chân hơi xoay ra.', 'Đẩy hông ra sau, gập gối, tay đưa ra trước giữ thăng bằng.', 'Xuống đến khi đùi song song sàn, đạp gót đứng lên.'],
      tip: 'Gót luôn chạm sàn, gối đi cùng hướng mũi chân, lưng thẳng.',
      anim: { keys: [[sqUp, 1.0, .2], [sqDn, 1.0, .2]], reps: 1 }
    },
    lunge: {
      group: 'legs', vi: 'Bước lùi chùng chân', en: 'Reverse Lunge', m: 'Đùi · Mông', sec: 3, dose: [8, 'b'],
      steps: ['Đứng thẳng, tay chống hông.', 'Bước một chân ra sau, hạ người đến khi hai gối gập khoảng 90°.', 'Đạp gót chân trước đứng lên, về chỗ. Đổi chân.'],
      tip: 'Gối sau gần chạm sàn, thân người thẳng đứng.',
      anim: { keys: [
        [P([108, 66], -90, onHips([108, 66]), [[110, 125], [107, 125]]), .9, .2],
        [P([82, 93], -90, onHips([82, 93]), [[110, 125], [54, 121]], { fp: [0, 55] }), .9, .2]
      ], reps: 1 }
    },
    bridge: {
      group: 'legs', vi: 'Nâng hông', en: 'Glute Bridge', m: 'Mông · Đùi sau', sec: 2.5, dose: [12, 'r'],
      steps: ['Nằm ngửa, gập gối, bàn chân đặt sàn gần mông.', 'Đạp gót nâng hông đến khi vai–hông–gối thẳng hàng.', 'Siết mông 1–2 giây rồi hạ.'],
      tip: 'Không ưỡn lưng quá. Lực đến từ mông, không phải lưng.',
      anim: { keys: [[brDn, .9, .1], [brUp, .8, .8]], reps: 1 }
    },
    singlebridge: {
      group: 'legs', vi: 'Nâng hông một chân', en: 'Single-leg Bridge', m: 'Mông · Đùi sau', sec: 2.5, dose: [10, 'b'],
      steps: ['Như nâng hông, nhưng duỗi thẳng một chân.', 'Đạp gót chân trụ nâng hông lên.', 'Làm hết rep một bên rồi đổi chân.'],
      tip: 'Hông giữ ngang bằng, không lệch sang bên chân duỗi.',
      anim: { keys: [[sbDn, .9, .1], [sbUp, .8, .8]], reps: 1 }
    },
    wallsit: {
      group: 'legs', vi: 'Ngồi dựa tường', en: 'Wall Sit', m: 'Đùi trước', sec: 1, dose: [30, 's'],
      steps: ['Dựa lưng vào tường, chân bước ra trước khoảng 2 bàn chân.', 'Trượt xuống đến khi đùi song song sàn, gối 90°.', 'Giữ nguyên, tay đặt trên đùi.'],
      tip: 'Gối ngay trên mắt cá, không vượt quá mũi chân.',
      anim: { keys: [
        [P([68, 95], -90, [[92, 92], [92, 92]], [[98, 125], [96, 125]]), 1.4, .4],
        [P([68, 95.8], -90, [[92, 92.8], [92, 92.8]], [[98, 125], [96, 125]]), 1.4, .4]
      ], hold: true, props: [{ wall: 59 }] }
    },
    calf: {
      group: 'legs', vi: 'Nhón bắp chân', en: 'Calf Raise', m: 'Bắp chân', sec: 2, dose: [15, 'r'],
      steps: ['Đứng thẳng, có thể vịn tường.', 'Nhón lên cao nhất bằng mũi chân.', 'Giữ 1 giây rồi hạ chậm.'],
      tip: 'Khó hơn: đứng trên mép bậc thang để gót hạ thấp hơn.',
      anim: { keys: [
        [P([100, 66], -90, [[103, 107], [101, 107]], [[100, 125], [98, 125]]), .6, .1],
        [P([100, 57], -90, [[103, 98], [101, 98]], [[100, 116], [98, 116]], { fp: [58, 58] }), .7, .5]
      ], reps: 1 }
    },
    bulgarian: {
      group: 'legs', vi: 'Squat chùng chân gác ghế', en: 'Bulgarian Split Squat', m: 'Đùi · Mông', sec: 3, dose: [8, 'b'],
      steps: ['Mu bàn chân sau gác lên ghế, chân trước cách ghế khoảng 2 bước ngắn.', 'Hạ người thẳng xuống đến khi đùi trước song song sàn.', 'Đạp gót chân trước đứng lên. Làm hết số rep rồi đổi chân.'],
      tip: 'Phần lớn trọng lượng dồn vào chân trước.',
      anim: { keys: [
        [P([96, 67], -84, onHips([96, 67]), [[114, 125], [52, 82]], { fp: [0, 70] }), 1.0, .2],
        [P([86, 93], -80, onHips([86, 93]), [[114, 125], [52, 82]], { fp: [0, 70] }), 1.0, .2]
      ], reps: 1, props: [{ box: [26, 86, 36] }] }
    },
    jumpsquat: {
      group: 'legs', vi: 'Squat bật nhảy', en: 'Jump Squat', m: 'Đùi · Mông · Sức bật', sec: 2, dose: [10, 'r'],
      steps: ['Squat xuống như thường.', 'Bật mạnh lên khỏi sàn, vung tay lên.', 'Tiếp đất mềm và chuyển ngay vào squat tiếp theo.'],
      tip: 'Tiếp đất êm, không để gối chụm vào trong.',
      anim: { keys: [[sqUp, .55, .05], [sqDn, .3, 0],
        [P([98, 52], -88, [[126, -14], [124, -14]], [[100, 112], [98, 112]], { fp: [45, 45] }), .35, 0]], reps: 1 }
    },

    /* ===== Đẩy · Ngực · Vai ===== */
    kneepushup: {
      group: 'push', vi: 'Chống đẩy quỳ gối', en: 'Knee Push-up', m: 'Ngực · Vai trước · Tay sau', sec: 2.5, dose: [8, 'r'],
      steps: ['Quỳ gối, tay đặt rộng hơn vai một chút.', 'Giữ người thẳng từ gối đến đầu, hạ ngực gần sàn.', 'Đẩy mạnh lên đến khi duỗi thẳng tay.'],
      tip: 'Hông không được chổng lên. Khuỷu tay hướng chéo ra sau khoảng 45°.',
      anim: { keys: pushKeys(80, 124, 30, 82, 110, 0, [55, 109]), reps: 1 }
    },
    pushup: {
      group: 'push', vi: 'Chống đẩy', en: 'Push-up', m: 'Ngực · Vai trước · Tay sau · Core', sec: 2.5, dose: [10, 'r'],
      steps: ['Tay đặt dưới vai, rộng hơn vai một chút, mũi chân chạm sàn.', 'Siết bụng và mông, người thẳng như tấm ván.', 'Hạ ngực cách sàn 3–5 cm rồi đẩy lên.'],
      tip: 'Lỗi hay gặp: võng hông, ngửa cổ. Mắt nhìn sàn phía trước tay.',
      anim: { keys: pushKeys(40, 119, 60, 82, 110, 0), reps: 1 }
    },
    diamond: {
      group: 'push', vi: 'Chống đẩy kim cương', en: 'Diamond Push-up', m: 'Tay sau · Ngực trong', sec: 2.5, dose: [8, 'r'],
      steps: ['Ngón cái và ngón trỏ hai tay chạm nhau thành hình thoi dưới ngực.', 'Người thẳng, hạ ngực xuống chạm gần tay.', 'Khuỷu tay ép sát thân khi đẩy lên.'],
      tip: 'Nếu đau cổ tay, mở rộng tay thêm 1 gang.',
      anim: { keys: pushKeys(40, 119, 60, 82, 111, -6), reps: 1 }
    },
    pike: {
      group: 'push', vi: 'Chống đẩy chữ V ngược', en: 'Pike Push-up', m: 'Vai · Tay sau', sec: 2.5, dose: [8, 'r'],
      steps: ['Từ tư thế chống đẩy, đi chân lại gần tay, đẩy hông lên cao thành chữ V ngược.', 'Gập khuỷu tay, hạ đỉnh đầu xuống phía trước hai tay.', 'Đẩy lên về chữ V.'],
      tip: 'Hông luôn cao. Đầu đi xuống phía trước tay, không phải giữa tay.',
      anim: { keys: [
        [P([94, 64], 46, [[146, 124], [146, 124]], [[80, 123], [80, 123]]), .9, .2],
        [P([98, 70], 58, [[146, 124], [146, 124]], [[80, 123], [80, 123]], { n: -8 }), .8, .1]
      ], reps: 1 }
    },
    decline: {
      group: 'push', vi: 'Chống đẩy chân cao', en: 'Decline Push-up', m: 'Ngực trên · Vai', sec: 2.5, dose: [8, 'r'],
      steps: ['Mũi chân gác lên ghế hoặc giường, tay chống sàn.', 'Người thẳng từ gót tới đầu.', 'Hạ ngực xuống sàn rồi đẩy lên.'],
      tip: 'Ghế càng cao càng khó. Bắt đầu với bậc thấp.',
      anim: { keys: pushKeys(40, 67, 60, 82, 110, 2), reps: 1, props: [{ box: [16, 70, 44] }] }
    },
    dip: {
      group: 'push', vi: 'Nhún tay sau trên ghế', en: 'Chair Dip', m: 'Tay sau · Vai trước', sec: 2.5, dose: [10, 'r'],
      steps: ['Ngồi mép ghế chắc chắn, tay nắm mép ghế sát hông.', 'Đẩy mông ra khỏi ghế, gập khuỷu tay hạ người đến khi cánh tay song song sàn.', 'Đẩy lên đến khi tay thẳng.'],
      tip: 'Khuỷu tay chỉ thẳng ra sau, không bè ra. Dùng ghế không có bánh xe.',
      anim: { keys: [
        [P([84, 82], -90, [[76, 83], [76, 83]], [[124, 125], [124, 125]]), .9, .2],
        [P([86, 104], -86, [[76, 83], [76, 83]], [[124, 125], [124, 125]]), .9, .1]
      ], reps: 1, props: [{ box: [36, 84, 44] }] }
    },

    /* ===== Lưng ===== */
    superman: {
      group: 'back', vi: 'Siêu nhân', en: 'Superman', m: 'Lưng dưới · Mông · Vai sau', sec: 3, dose: [10, 'r'],
      steps: ['Nằm sấp, tay duỗi thẳng qua đầu.', 'Đồng thời nâng tay, ngực và chân khỏi sàn.', 'Giữ 1–2 giây rồi hạ chậm.'],
      tip: 'Nâng vừa đủ, không ngửa cổ. Mắt nhìn sàn.',
      anim: { keys: [
        [P([90, 123], -1, [[172, 124], [172, 124]], [[30, 123], [30, 123]]), .9, .1],
        [P([90, 122], -11, [[170, 103], [170, 103]], [[32, 110], [32, 110]], { n: -6 }), .7, .9]
      ], reps: 1 }
    },
    birddog: {
      group: 'back', vi: 'Chó chim', en: 'Bird Dog', m: 'Core · Lưng dưới · Mông', sec: 2.5, dose: [6, 'b'],
      steps: ['Quỳ bốn điểm: tay dưới vai, gối dưới hông.', 'Duỗi tay phải ra trước và chân trái ra sau, thành một đường thẳng.', 'Giữ 2 giây, về chỗ, đổi bên.'],
      tip: 'Lưng phẳng như mặt bàn, hông không xoay.',
      anim: { keys: [
        [bdBase([120, 124], [120, 124], kneeFoot, kneeFoot), .8, .1],
        [bdBase([161, 82], [120, 124], kneeFoot, [22, 92]), .8, .9],
        [bdBase([120, 124], [120, 124], kneeFoot, kneeFoot), .8, .1],
        [bdBase([120, 124], [161, 82], [22, 92], kneeFoot), .8, .9]
      ], reps: 2 }
    },

    /* ===== Core · Bụng ===== */
    plank: {
      group: 'core', vi: 'Plank cẳng tay', en: 'Forearm Plank', m: 'Core · Vai', sec: 1, dose: [30, 's'],
      steps: ['Chống cẳng tay, khuỷu tay ngay dưới vai.', 'Duỗi chân, siết bụng và mông.', 'Giữ người thẳng, thở đều.'],
      tip: 'Hông không võng, không chổng. Không nín thở.',
      anim: { keys: [
        [P(pl1.h, pl1.t, plHands, [[40, 119], [40, 119]]), 1.2, .3],
        [P(pl2.h, pl2.t, plHands, [[40, 119], [40, 119]]), 1.2, .3]
      ], hold: true }
    },
    sideplank: {
      group: 'core', vi: 'Plank nghiêng', en: 'Side Plank', m: 'Bụng chéo · Hông', sec: 1, dose: [20, 'sb'],
      steps: ['Nằm nghiêng, chống khuỷu tay dưới vai, hai chân chồng lên nhau.', 'Nâng hông lên thành đường thẳng từ vai tới chân.', 'Tay trên giơ thẳng lên trần. Giữ đủ thời gian rồi đổi bên.'],
      tip: 'Hông không đổ về sau. Dễ hơn: hạ gối dưới xuống sàn.',
      anim: { front: true, keys: [[sidePlank(110), 1.3, .6], [sidePlank(115), 1.3, .2]], hold: true }
    },
    deadbug: {
      group: 'core', vi: 'Bọ chết', en: 'Dead Bug', m: 'Core sâu', sec: 3, dose: [6, 'b'],
      steps: ['Nằm ngửa, tay thẳng lên trần, gối và hông gập 90°.', 'Hạ tay một bên ra sau đầu và duỗi chân bên đối diện, gần chạm sàn.', 'Về chỗ, đổi bên. Mỗi bên tính 1 rep.'],
      tip: 'Ép lưng dưới xuống sàn suốt bài. Đi chậm.',
      anim: { keys: [
        [P([86, 122], 180, [[46, 80], [46, 80]], [[116, 92], [116, 92]]), 1, .1],
        [P([86, 122], 180, [[6, 116], [46, 80]], [[116, 92], [145, 117]]), 1, .4],
        [P([86, 122], 180, [[46, 80], [46, 80]], [[116, 92], [116, 92]]), 1, .1],
        [P([86, 122], 180, [[46, 80], [6, 116]], [[145, 117], [116, 92]]), 1, .4]
      ], reps: 2 }
    },
    crunch: {
      group: 'core', vi: 'Gập bụng', en: 'Crunch', m: 'Bụng trên', sec: 2, dose: [12, 'r'],
      steps: ['Nằm ngửa, gập gối, tay để nhẹ hai bên thái dương.', 'Thở ra, cuộn vai khỏi sàn bằng lực bụng.', 'Hạ chậm, không thả rơi.'],
      tip: 'Không kéo cổ bằng tay. Giữ khoảng cách cằm–ngực bằng một nắm tay.',
      anim: { keys: [
        [P([94, 122], 180, [[44, 112], [44, 112]], [[121, 125], [121, 125]]), .7, .1],
        [P([94, 122], 207, [[52, 92], [52, 92]], [[121, 125], [121, 125]], { n: 14 }), .6, .4]
      ], reps: 1 }
    },
    bicycle: {
      group: 'core', vi: 'Đạp xe gập bụng', en: 'Bicycle Crunch', m: 'Bụng chéo · Bụng trên', sec: 1.5, dose: [16, 'r'],
      steps: ['Nằm ngửa, vai nâng khỏi sàn, tay ở thái dương.', 'Kéo một gối vào, xoay khuỷu tay bên kia về phía gối đó.', 'Đổi bên như đạp xe. Mỗi bên tính 1 rep.'],
      tip: 'Chậm và xoay hết tầm tốt hơn đạp nhanh.',
      anim: { keys: [
        [P([90, 122], 207, [[50, 94], [50, 94]], [[108, 94], [148, 108]], { n: 14, fp: [-40, -40] }), .45, .15],
        [P([90, 122], 207, [[50, 94], [50, 94]], [[148, 108], [108, 94]], { n: 14, fp: [-40, -40] }), .45, .15]
      ], reps: 2 }
    },
    legraise: {
      group: 'core', vi: 'Nâng chân', en: 'Lying Leg Raise', m: 'Bụng dưới · Gập hông', sec: 3, dose: [10, 'r'],
      steps: ['Nằm ngửa, tay đặt dưới mông hoặc dọc thân.', 'Giữ chân thẳng, nâng lên đến khi vuông góc sàn.', 'Hạ chậm, gót cách sàn vài cm rồi lên tiếp.'],
      tip: 'Lưng dưới áp sàn. Nếu lưng bị cong lên, gập nhẹ gối.',
      anim: { keys: [
        [P([84, 122], 180, supineArms, [[143, 116], [143, 116]], { fp: [-60, -60] }), 1.0, .15],
        [P([84, 122], 180, supineArms, [[92, 63], [92, 63]], { fp: [-60, -60] }), 1.3, .1]
      ], reps: 1 }
    },
    flutter: {
      group: 'core', vi: 'Đá chân luân phiên', en: 'Flutter Kick', m: 'Bụng dưới', sec: .6, dose: [30, 's'],
      steps: ['Nằm ngửa, vai và chân nâng nhẹ khỏi sàn.', 'Đá chân lên xuống luân phiên, biên độ nhỏ.', 'Giữ nhịp đều, thở đều.'],
      tip: 'Lưng dưới luôn áp sàn.',
      anim: { keys: [
        [P([84, 122], 192, [[90, 123], [90, 123]], [[142, 101], [142, 113]], { n: 12, fp: [-60, -60] }), .28, 0],
        [P([84, 122], 192, [[90, 123], [90, 123]], [[142, 113], [142, 101]], { n: 12, fp: [-60, -60] }), .28, 0]
      ], reps: 2 }
    },
    russian: {
      group: 'core', vi: 'Xoay người kiểu Nga', en: 'Russian Twist', m: 'Bụng chéo', sec: 1.2, dose: [20, 'r'],
      steps: ['Ngồi ngả lưng khoảng 45°, chân co và nhấc khỏi sàn.', 'Chắp tay, xoay vai mang tay chạm sàn cạnh hông trái.', 'Xoay sang phải. Mỗi bên tính 1 rep.'],
      tip: 'Xoay vai chứ không chỉ đưa tay. Dễ hơn: đặt gót xuống sàn.',
      anim: (function () {
        const rt = (hand) => P([92, 121], 232, [hand, hand], [[130, 104], [130, 104]], { n: 22, fp: [-20, -20] });
        return { keys: [[rt([100, 92]), .35, 0], [rt([100, 121]), .35, .1], [rt([100, 92]), .35, 0], [rt([86, 122]), .35, .1]], reps: 2 };
      })()
    },
    hollow: {
      group: 'core', vi: 'Giữ thân thuyền', en: 'Hollow Hold', m: 'Core', sec: 1, dose: [20, 's'],
      steps: ['Nằm ngửa, ép lưng dưới xuống sàn.', 'Nâng vai, tay duỗi qua đầu và chân thẳng khỏi sàn.', 'Giữ hình chiếc thuyền, thở đều.'],
      tip: 'Lưng bị cong lên thì nâng chân cao hơn.',
      anim: (function () {
        const hh = (u) => P([92, 122], 200 + u, [[14, 100 - u], [14, 100 - u]], [[150, 108 - u], [150, 108 - u]], { n: 12, fp: [-60, -60] });
        return { keys: [[hh(0), 1.2, .3], [hh(2), 1.2, .3]], hold: true };
      })()
    },
    vup: {
      group: 'core', vi: 'Gập người chữ V', en: 'V-up', m: 'Bụng trên · Bụng dưới', sec: 2.5, dose: [10, 'r'],
      steps: ['Nằm duỗi thẳng, tay qua đầu.', 'Cùng lúc nâng thân và chân, tay chạm mũi chân.', 'Hạ chậm về tư thế nằm.'],
      tip: 'Dùng lực bụng, không vung tay lấy đà.',
      anim: { keys: [
        [P([92, 122], 180, [[10, 120], [10, 120]], [[152, 120], [152, 120]], { fp: [-60, -60] }), .9, .15],
        [P([92, 122], 235, [[120, 72], [120, 72]], [[126, 73], [126, 73]], { n: 10, fp: [-60, -60] }), .7, .2]
      ], reps: 1 }
    },

    /* ===== Tim mạch ===== */
    march: {
      group: 'cardio', vi: 'Đi bộ nâng gối tại chỗ', en: 'March in place', m: 'Tim mạch · Hông', sec: 1, dose: [40, 'r'],
      steps: ['Đứng thẳng, siết nhẹ bụng.', 'Nâng gối lên khoảng ngang hông, tay đánh ngược chân.', 'Đổi chân liên tục, nhịp đều.'],
      tip: 'Không ngả người ra sau khi nâng gối.',
      anim: { keys: knees(false, 66, .38), reps: 2 }
    },
    jumpingjack: {
      group: 'cardio', vi: 'Bật nhảy dang tay chân', en: 'Jumping Jack', m: 'Tim mạch · Toàn thân', sec: 1.5, dose: [30, 'r'],
      steps: ['Đứng thẳng, hai chân khép, tay xuôi.', 'Bật nhảy dang chân rộng hơn vai, đồng thời vung tay qua đầu.', 'Bật về tư thế đầu. Đó là 1 rep.'],
      tip: 'Tiếp đất bằng nửa trước bàn chân, gối hơi chùng để đỡ khớp.',
      anim: { front: true, keys: [
        [P([100, 66], -90, [[89, 106], [111, 106]], [[96, 125], [104, 125]]), .28, .04],
        [P([100, 64], -90, [[70, -14], [130, -14]], [[80, 121], [120, 121]]), .28, .04]
      ], reps: 1 }
    },
    highknees: {
      group: 'cardio', vi: 'Chạy nâng cao đùi', en: 'High Knees', m: 'Tim mạch · Bụng dưới', sec: .5, dose: [30, 'r'],
      steps: ['Chạy tại chỗ trên mũi chân.', 'Đùi nâng ngang hông mỗi bước.', 'Tay đánh mạnh theo nhịp chân.'],
      tip: 'Giữ lưng thẳng, mắt nhìn trước. Mệt thì giảm tốc độ, đừng gù lưng.',
      anim: { keys: knees(true, 64, .17), reps: 2 }
    },
    mountain: {
      group: 'cardio', vi: 'Leo núi', en: 'Mountain Climber', m: 'Core · Vai · Tim mạch', sec: .5, dose: [30, 'r'],
      steps: ['Tư thế chống đẩy cao, tay dưới vai.', 'Kéo một gối về phía ngực.', 'Đổi chân nhanh như đang chạy.'],
      tip: 'Hông giữ ngang, không nảy lên xuống.',
      anim: { keys: [[mc(true), .22, .02], [mc(false), .22, .02]], reps: 2 }
    },
    squatthrust: {
      group: 'cardio', vi: 'Burpee bước lùi', en: 'Squat Thrust', m: 'Toàn thân', sec: 3, dose: [8, 'r'],
      steps: ['Ngồi xuống, đặt tay xuống sàn.', 'Bật hai chân ra sau thành tư thế plank cao.', 'Bật chân về và đứng lên.'],
      tip: 'Mới tập có thể bước từng chân thay vì bật.',
      anim: { keys: [[bStand, .5, .1], [bSquat, .35, 0], [bPlank, .35, .25], [bSquat, .5, 0]], reps: 1 }
    },
    burpee: {
      group: 'cardio', vi: 'Burpee', en: 'Burpee', m: 'Toàn thân · Tim mạch', sec: 4, dose: [8, 'r'],
      steps: ['Ngồi xuống, tay chạm sàn.', 'Bật chân ra sau, chống đẩy 1 cái.', 'Bật chân về, bật nhảy lên và vỗ tay qua đầu.'],
      tip: 'Giữ form đúng quan trọng hơn tốc độ. Hít thở ở đỉnh mỗi rep.',
      anim: { keys: [[bStand, .45, .05], [bSquat, .3, 0], [bPlank, .45, 0], [bLow, .45, 0], [bPlank, .3, 0], [bSquat, .35, 0], [bAir, .35, 0]], reps: 1 }
    }
  };
})();
