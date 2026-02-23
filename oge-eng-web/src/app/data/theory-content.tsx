/* eslint-disable react/no-unescaped-entities */

import React from "react";

import styles from "@/app/theory/[category]/[topic]/TheoryTopicPage.module.css";

export const theoryContent: Record<string, React.ReactNode> = {
  procedure: (
    <div>
      <p>
        Экзамен по английскому языку состоит из 2-х частей: письменной и устной.
        В 2026 году экзамен проходит 6 июня.
      </p>
      <p>
        Максимальный балл за этот экзамен — 70. За письменную часть можно
        получить 55 баллов (15 за аудирование+15 за чтение+15 за грамматику и
        лексику/языковой материал+10 за письмо). Сумма баллов за устную часть —
        15 (2 за чтение текста+6 за ответы в диалоге-расспросе+7 за тему).
      </p>
      <p>Соответствие баллов ОГЭ отметкам:</p>
      <ul>
        <li>59-70 - «5»</li>
        <li>46-58 - «4»</li>
        <li>29-45 - «3»</li>
        <li>0-28 - «2»</li>
      </ul>
      <p>
        Письменная часть продолжается 120 минут (30 минут на аудирование+30
        минут на чтение+30 минут на грамматику и лексику+30 минут на письмо).
        <br />
        Продолжительность устной части — 15 минут.
      </p>
    </div>
  ),
  listening: (
    <div>
      <p>
        Для развития навыков аудирования полезно слушать запись несколько раз:
        первый раз только слушаем, второй раз слушаем и следим по тексту, третий
        раз снова только слушаем.
        <br />
        При выполнении заданий обращайте внимание на пояснение ответов. При
        необходимости слушайте запись снова.
        <br />
        Просмотр сериалов и мультфильмов на английском также поможет Вам
        улучшить понимание звучащей речи.
      </p>
    </div>
  ),
  reading: (
    <div>
      <p>
        При выполнении первого задания (соотнести заголовки и тексты) Вам
        необходимо знать перевод заголовка и приблизительно понимать содержание
        текста. Постарайтесь перевести все заголовки, которые есть в заданиях
        открытого банка ФИПИ.
      </p>
      <p>
        Сложный момент во втором задании на чтение (текст с утверждениями на
        true/false/not stated) — это различие false и not stated. Если в тексте
        есть явное опровержение того, о чем сказано в утверждении, это false.
        Если в тексте отсутствует информация, запрошенная в утверждении, — это
        not stated. Не додумывайте и не делайте выводы на основе Ваших
        предположений. Опирайтесь только на то, о чём написано в тексте.
      </p>
    </div>
  ),
  "language-material": (
    <div>
      <p>
        В приложении проработаны абсолютно все задания этого раздела, поэтому
        тренируйте их почаще. Не забывайте обращаться к разделу «теория →
        языковой материал», в котором даны правила и примеры на все
        грамматические темы, которые могут встретиться на экзамене.
      </p>
    </div>
  ),
  writing: (
    <div>
      <p>
        Выполнение всех условий, указанных и разделе «теория→ письмо», и
        выполнение упражнений принесёт Вам высокий балл. Для более точной оценки
        посмотрите критерии оценивания личного письма в демоверсии ОГЭ.
        Тренируйтесь писать письма на разные темы (их можно найти на сайте
        Открытый банк заданий ОГЭ → английский → письмо) и проверяйте, все ли
        критерии Вы выполнили. Желательно попросить преподавателя, знакомого с
        критериями оценивания, проверить несколько работ и поставить баллы.
      </p>
    </div>
  ),
  "plural-nouns": (
    <div>
      <h5>Большинство существительных</h5>
      <p>
        Чтобы образовать множественное число, нужно прибавить к существительному
        букву <b>-s</b>.<br />
        Например: a dog – dog<b>s</b>; a game – game<b>s</b>; a toy – toy
        <b>s</b>
      </p>
      <h5>Существительные, оканчивающиеся на определённые буквы</h5>
      <p>
        Если существительное оканчивается на <b>-o</b>, <b>-ch</b>, <b>-sh</b>,{" "}
        <b>-s</b>, <b>-ss</b>, <b>-x</b>, добавляем <b>-es</b>.<br />
        Например: a potato-potato<b>es</b>; a match – match<b>es</b>; a bush –
        bush<b>es</b>; a bus – bus<b>es</b>; a glass – glass<b>es</b>; a box –
        box<b>es</b>
      </p>
      <p>
        Если существительное оканчивается на <b>согласная+y</b>, то <b>y</b>{" "}
        меняется на <b>-i</b> и добавляется <b>-es</b>.<br />
        Например: a country – countr<b>ies</b>; a party – part<b>ies</b>; a
        story – stor<b>ies</b>
      </p>
      <p>
        Если существительное оканчивается на <b>-f</b> или <b>-fe</b>, то{" "}
        <b>-f/-fe</b> меняется на <b>-v</b> и добавляется <b>-es</b>.<br />
        Например: a life – li<b>ves</b>; a leaf – lea<b>ves</b>; a wolf – wol
        <b>ves</b>
      </p>
      <h5>Исключения</h5>
      <p>
        К исключениям, которые могут встретиться в ОГЭ, относятся следующие:
      </p>
      <ul>
        <li>
          a m<b>a</b>n – m<b>e</b>n
        </li>
        <li>
          a wom<b>a</b>n – wom<b>e</b>n
        </li>
        <li>
          a child – child<b>ren</b>
        </li>
        <li>a fish – fish</li>
        <li>
          a m<b>ous</b>e – m<b>ic</b>e
        </li>
        <li>
          a f<b>oo</b>t – f<b>ee</b>t
        </li>
        <li>
          a t<b>oo</b>th – t<b>ee</b>th
        </li>
        <li>
          a g<b>oo</b>se – g<b>ee</b>se
        </li>
      </ul>
    </div>
  ),
  "ordinal-numerals": (
    <div>
      <h5>Большинство числительных</h5>
      <p>
        Чтобы образовать порядковое числительное, нужно прибавить к
        количественному числительному буквы <b>-th</b>.<br />
        Например: four – four<b>th</b>, seven – seven<b>th</b>, twenty-six -
        twenty-six<b>th</b>
      </p>
      <h5>Числительные, оканчивающиеся на определённые буквы</h5>
      <p>
        Если числительное оканчивается на <b>-ve</b> (в английском это 5(fi
        <b>ve</b>) и 12(twel<b>ve</b>)), меняем <u>ve</u> на <u>f</u> и
        добавляем <b>-th</b>.<br />
        Например: fi<u>ve</u> – fi<u>f</u>
        <b>th</b>, twel<u>ve</u>-twel<u>f</u>
        <b>th</b>
      </p>
      <p>
        Если числительное оканчивается на <b>-y</b> (в английском это 20, 30, 40
        и т.д.), то <u>y</u> меняется на <u>i</u> и добавляется <b>-eth</b>.
        <br />
        Например: twent<u>y</u> – twent<u>i</u>
        <b>eth</b>, sixt<u>y</u> – sixt<u>i</u>
        <b>eth</b>, ninet<u>y</u> - ninet<u>i</u>
        <b>eth</b>
      </p>
      <p>
        В числительном 8 добавляется только буква <b>h</b>:<br />
        eight – eigh<b>th</b>
      </p>
      <p>
        В числительном 9 исчезает буква <b>e</b>:<br />
        nin<b>e</b> - nin<b>th</b>
      </p>
      <h5>Исключения</h5>
      <p>К исключениям относятся числительные 1, 2 и 3:</p>
      <ul>
        <li>one – first</li>
        <li>two – second</li>
        <li>three – third</li>
      </ul>
      <p>
        Обратите внимание, что в составном числительном (из нескольких слов)
        меняется только последнее слово, как и в русском языке.
        <br />
        Например:
        <br />
        thirty-one – thirty-<b>first</b> (тридцать <b>первый</b> — тридцать{" "}
        <b>первого</b>)<br />
        one hundred and eighty-<b>four</b> - one hundred and eighty-
        <b>fourth</b> (сто восемьдесят <b>четыре</b> - сто восемьдесят{" "}
        <b>четвёртый</b>)
      </p>
    </div>
  ),
  "possessive-pronouns": (
    <div>
      <p>
        Притяжательные местоимения отвечают на вопрос <b>Чей? Чья? Чьё? Чьи?</b>
        <br />
        Например: <b>my</b> room (<b>моя</b> комната), <b>his</b> phone (
        <b>его</b> телефон).
      </p>
      <p>
        В английском языке у притяжательных местоимений нет рода, числа и
        падежа, то есть они не изменяются: <b>моя</b> комната — <b>my</b> room,{" "}
        <b>мои</b> комнаты — <b>my</b> rooms, <b>моей</b> комнаты — <b>my</b>{" "}
        room, <b>мой</b> телефон — <b>my</b> phone.
      </p>
      <p>
        Притяжательные местоимения делятся на 2 группы в зависимости от места в
        предложении:{" "}
      </p>
      <ul>
        <li>
          Притяжательные местоимения, после которых стоит <i>существительное</i>{" "}
          (<b>my</b> <i>keys</i>, <b>his</b> <i>book</i>, <b>their</b>{" "}
          <i>money</i>).
        </li>
        <li>
          Притяжательные местоимения, после которых нет существительного (The
          keys are <b>mine</b>, Whose book is this?-<b>His</b>, The money is{" "}
          <b>theirs</b>).
        </li>
      </ul>
      <table>
        <thead>
          <tr>
            <th>Личное местоимение</th>
            <th>Притяжательное местоимение + существительное</th>
            <th>Притяжательное местоимение без существительного</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>I</td>
            <td>My - мой</td>
            <td>
              <b>Mine</b>
            </td>
          </tr>
          <tr>
            <td>You</td>
            <td>Your - твой</td>
            <td>
              Your<b>s</b>
            </td>
          </tr>
          <tr>
            <td>He</td>
            <td>His - его</td>
            <td>His</td>
          </tr>
          <tr>
            <td>She</td>
            <td>Her - её</td>
            <td>
              Her<b>s</b>
            </td>
          </tr>
          <tr>
            <td>It</td>
            <td>Its - этого</td>
            <td>Its</td>
          </tr>
          <tr>
            <td>We</td>
            <td>Our - наш</td>
            <td>
              Our<b>s</b>
            </td>
          </tr>
          <tr>
            <td>They</td>
            <td>Their - их</td>
            <td>
              Their<b>s</b>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  ),
  "object-pronouns": (
    <div>
      <p>
        В английском языке у личных местоимений 2 падежа: именительный и
        объектный (косвенный: от родительного до предложного).{" "}
      </p>
      <p>
        Местоимения в именительном падеже отвечают на вопросы Кто? Что? и в
        предложении являются <u>подлежащим</u>.<br />
        Например:{" "}
        <b>
          <u>She</u>
        </b>{" "}
        likes fruit.{" "}
        <b>
          <u>We</u>
        </b>{" "}
        walk our dog twice a day. Can{" "}
        <b>
          <u>you</u>
        </b>{" "}
        open the door?
      </p>
      <p>
        Местоимения в косвенном падеже отвечают на вопросы Кого? Чего? Кому?
        Чему? Кем? Чем? О ком? О чём? и в предложении являются{" "}
        <span className="object">дополнением</span>.<br />
        Например: Help{" "}
        <b>
          <span className="object">me</span>
        </b>
        ! Don't ask{" "}
        <b>
          <span className="object">him</span>
        </b>
        . They are waiting for{" "}
        <b>
          <span className="object">us</span>
        </b>
        .
      </p>
      <table>
        <tbody>
          <tr>
            <th>Именительный падеж</th>
            <th>Объектный падеж</th>
          </tr>
          <tr>
            <td>I</td>
            <td>me</td>
          </tr>
          <tr>
            <td>you</td>
            <td>you</td>
          </tr>
          <tr>
            <td>he</td>
            <td>him</td>
          </tr>
          <tr>
            <td>she</td>
            <td>her</td>
          </tr>
          <tr>
            <td>it</td>
            <td>it</td>
          </tr>
          <tr>
            <td>we</td>
            <td>us</td>
          </tr>
          <tr>
            <td>they</td>
            <td>them</td>
          </tr>
        </tbody>
      </table>
    </div>
  ),
  "reflexive-pronouns": (
    <div>
      <h5>Возвратные местоимения (Себя, сам)</h5>
      <p>
        Возвратные местоимения используются, когда <u>подлежащее</u> и{" "}
        <b>дополнение</b> один и тот же человек/предмет.
      </p>
      <p>Например:</p>
      <ul>
        <li>
          <u>I</u> solved the problem <b>myself</b> — <u>Я</u> решил задачу{" "}
          <b>сам</b>.
        </li>
        <li>
          <u>He</u> blames <b>himself</b> — <u>Он</u> винит <b>себя</b>.
          (Сравните: <u>He</u> blames <b>her</b> — <u>Он</u> винит <b>её</b>).
        </li>
        <li>
          <u>We</u> can't do it <b>ourselves</b> — <u>Мы</u> не можем сделать
          это <b>сами</b>.
        </li>
      </ul>
      <table>
        <thead>
          <tr>
            <th>Личное местоимение</th>
            <th>Возвратное местоимение</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>I</td>
            <td>Myself</td>
          </tr>
          <tr>
            <td>You - ты</td>
            <td>Yourself</td>
          </tr>
          <tr>
            <td>He</td>
            <td>Himself</td>
          </tr>
          <tr>
            <td>She</td>
            <td>Herself</td>
          </tr>
          <tr>
            <td>It</td>
            <td>Itself</td>
          </tr>
          <tr>
            <td>We</td>
            <td>Ourselves</td>
          </tr>
          <tr>
            <td>You - вы</td>
            <td>Yourselves</td>
          </tr>
          <tr>
            <td>They</td>
            <td>Themselves</td>
          </tr>
        </tbody>
      </table>
    </div>
  ),
  "passive-voice": (
    <div>
      <h5>Пассивный залог в настоящем и прошедшем</h5>
      <p>
        В пассивном залоге <u>подлежащее</u> пассивно, то есть не выполняет
        действия, выраженного <b>сказуемым</b>.<br />
        Например: <u>Книга</u> <b>была написана</b> в 17-ом веке (книга не
        писала, её кто-то написал). — The <u>book</u> <b>was written</b> in the
        17<sup>th</sup> century.
      </p>
      <p>Пассивный залог используется, когда: </p>
      <ul>
        <li>
          объект важнее того, кто совершает действие: These phones{" "}
          <b>are made</b> in China / Эти телефоны <b>сделаны</b> в Китае.
          (Телефоны для нас важнее, чем тот, кто их сделал).{" "}
        </li>
        <li>
          тот, кто совершает действие, неизвестен: My bike <b>was stolen</b>{" "}
          yesterday / Мой велосипед <b>был украден</b> вчера. (Мы не знаем, кто
          украл велосипед).{" "}
        </li>
        <li>
          тот, кто совершает действие, и так понятен: Our tests{" "}
          <b>will be checked</b> tomorrow / Наши тесты <b>будут проверены</b>{" "}
          завтра. (Понятно, что наш учитель будет проверять тесты).{" "}
        </li>
      </ul>
      <p>
        Общая формула пассивного залога: <b>be + V3</b>. Чтобы употребить
        пассивный залог в нужном простом времени (Present Simple, Past Simple,
        Future Simple), возьмём подходящую форму глагола <b>be</b> (быть) из
        таблицы и добавим смысловой глагол в 3-ей форме.
      </p>
      <table>
        <thead>
          <tr>
            <th colSpan={3}>
              <b>Be</b> / быть
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Past Simple / Прошедшее Простое</th>
            <th>Present Simple / Настоящее Простое</th>
            <th>Future Simple / Будущее Простое</th>
          </tr>
          <tr>
            <td>
              <u>I/he/she/it</u> <b>was</b>
              <br />
              <u>you/we/they</u> <b>were</b>
            </td>
            <td>
              <u>I</u> <b>am</b>
              <br />
              <u>he/she/it</u> <b>is</b>
              <br />
              <u>you/we/they</u> <b>are</b>
            </td>
            <td>
              <u>I/you/he/she/it/we/they</u> <b>will be</b>
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        <ul>
          <li>
            Вчера мой <u>велосипед</u> <b>угнали</b>. Yesterday my <u>bike</u>{" "}
            <b>was stolen</b>.{" "}
          </li>
          <li>
            Каждый год <u>Москву</u> <b>посещают</b> более миллиона туристов.
            Every year <u>Moscow</u> <b>is visited</b> by more than one million
            tourists.{" "}
          </li>
          <li>
            В следующем году в нашем городе <b>построят</b> новый <u>стадион</u>
            . Next year a new <u>stadium</u> <b>will be built</b> in our
            city.{" "}
          </li>
        </ul>
      </p>
      <p>
        <i>
          Пассивный залог во временах групп Perfect и Continuous строится
          по-другому (глагол <b>be</b> ставится в формулу соответствующего
          времени), но это не встретится в данном экзамене.
        </i>{" "}
      </p>
    </div>
  ),
  "i-wish-v2": (
    <div>
      <p>
        I wish ... — разновидность условного предложения. Возможны 2 варианта
        построения предложений:
      </p>
      <p>
        <u>I wish</u> he <b>lived</b> here (<u>I wish</u> + <b>V2</b>) — жалеем
        о том, что он не живёт здесь сейчас.
        <br />
        <u>I wish</u> he <b>had lived</b> here (<u>I wish</u> + <b>had V3</b>) —
        жалеем о том, что он не жил здесь в прошлом.
      </p>
      <p>
        В ОГЭ вам понадобится только формула <u>I wish</u> + <b>V2</b>, поэтому
        смело ставьте глагол после I wish во вторую форму.
        <br />
        Например: <u>I wish</u> I <b>could</b> speak French. <u>I wish</u> he{" "}
        <b>came</b> to visit us. <u>I wish</u> we <b>had</b> more money.
      </p>
    </div>
  ),
  "conditional-real": (
    <div>
      <p>
        Условное предложение — сложноподчинённое предложение, обе части которого
        относятся к будущему времени. Ситуация реальная, условие может
        исполниться.
        <br />
        Например: Если <b>будет</b> хорошая погода, мы <b>пойдем</b> гулять.
      </p>
      <p>
        В английском языке обе части также относятся к <b>будущему</b> времени,
        но глагол в части с «если» используется в <u>настоящем</u> времени
        (Present Simple). То есть: Если <u>есть</u> хорошая погода, мы{" "}
        <b>пойдем</b> гулять. If the weather <u>is</u> good, we <b>will go</b>{" "}
        for a walk.{" "}
      </p>
      <p>
        Формула: <b>If + V/Vs, will V</b>
      </p>
    </div>
  ),
  "conditional-unreal": (
    <div>
      <p>
        Условное предложение — сложноподчинённое предложение, обе части которого
        относятся к настоящему времени. Ситуация нереальная, условие не может
        исполниться сейчас.
        <br />
        Например: Если бы у меня <b>была</b> сестра, мы бы <b>делили</b> комнату
        (сестры у меня нет).{" "}
      </p>
      <p>
        В английском языке обе части также относятся к настоящему времени, но
        глагол в части с «если» используется в <u>прошедшем</u> времени (Past
        Simple), а в другой части используется <b>would + V</b>. То есть: If I{" "}
        <u>had</u> a sister, we <b>would share</b> a room.{" "}
      </p>
      <p>
        Формула: <b>If + V2/Ved, would V</b>
      </p>
    </div>
  ),
  "to-be-forms": (
    <div>
      <p>
        Глагол <b>be</b> имеет особые формы спряжения. Чтобы выбрать нужную
        форму, обратите внимание на то, в каком времени предложение.
      </p>
      <p>Примеры:</p>
      <ul>
        <li>
          I <u>passed</u> the exam that's why I <b>was</b> happy (предложение в
          прошедшем времени).{" "}
        </li>
        <li>
          Thousands of tourists <u>visit</u> Italy every year as it <b>is</b>{" "}
          very famous (предложение в настоящем времени).{" "}
        </li>
        <li>
          I <u>hope one day</u> people <b>will be</b> kinder (предложение о
          надеждах на будущее).{" "}
        </li>
      </ul>
      <table>
        <thead>
          <tr>
            <th colSpan={3}>
              <b>Be</b> / быть
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Past Simple / Прошедшее Простое</th>
            <th>Present Simple / Настоящее Простое</th>
            <th>Future Simple / Будущее Простое</th>
          </tr>
          <tr>
            <td>
              <u>I/he/she/it</u> <b>was</b>
              <br />
              <u>you/we/they</u> <b>were</b>
            </td>
            <td>
              <u>I</u> <b>am</b>
              <br />
              <u>he/she/it</u> <b>is</b>
              <br />
              <u>you/we/they</u> <b>are</b>
            </td>
            <td>
              <u>I/you/he/she/it/we/they</u> <b>will be</b>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  ),
  "modal-verbs": (
    <div>
      <p>
        Модальные глаголы выражают отношение говорящего к действию (совет,
        разрешение, обязанность и т.д.). К ним относятся{" "}
        <b>can, must, should, may, have to</b> и др.
      </p>
      <p>
        Модальные глаголы не изменяются, то есть, не добавляются -s, -ed, -ing.
        <br />
        После модальных глаголов следует <u>инфинитив</u>.<br />В вопросах
        модальный глагол ставится в начале предложения, в отрицании добавляется{" "}
        <b>not / -n't</b> после глагола; вспомогательные глаголы не нужны.
      </p>
      <p>
        Например:
        <br />
        We <b>can</b> <u>swim</u>. We <b>can not</b> <u>swim</u>. <b>Can</b> we{" "}
        <u>swim</u>? — настоящее время
        <br />
        We <b>could</b> <u>swim</u>. We <b>could not</b> <u>swim</u>.{" "}
        <b>Could</b> we <u>swim</u>? — прошедшее время
        <br />
        He <b>should</b> <u>sleep</u> more. He <b>shouldn't</b> <u>sleep</u>{" "}
        more. <b>Should</b> he <u>sleep</u> more?
        <br />
        They <b>must</b> <u>go</u>. They <b>mustn't</b> <u>go</u>. <b>Must</b>{" "}
        they <u>go</u>?
      </p>
    </div>
  ),
  "present-simple": (
    <div>
      <p>
        Ниже приводятся основные обозначения, используемые в таблице:
        <br />V = verb (глагол)
        <br />
        <span className="affirmative">+</span> = утвердительное предложение
        <br />
        <span className="negative">-</span> = отрицательное предложение
        <br />
        <span className="question">?</span> = вопросительное предложение
      </p>
      <table>
        <tbody>
          <tr>
            <td>Время</td>
            <td>
              <h2>Present Simple</h2>
            </td>
          </tr>
          <tr>
            <td>Формула</td>
            <td>
              <table className="tense-table">
                <thead>
                  <tr>
                    <th>&nbsp;</th>
                    <th className="affirmative">+</th>
                    <th className="negative">-</th>
                    <th className="question">?</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <u>I/you/we/they</u>
                    </td>
                    <td className="affirmative">V</td>
                    <td className="negative">do not V/don't V</td>
                    <td className="question">Do ___ V?</td>
                  </tr>
                  <tr>
                    <td>
                      <u>He/she/it</u>
                    </td>
                    <td className="affirmative">Vs</td>
                    <td className="negative">does not V/doesn't V</td>
                    <td className="question">Does ___ V?</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td>Употребление/примеры</td>
            <td>
              <p>
                Регулярные действия/привычки:
                <br />I <b>clean</b> my teeth <u>twice a day</u>.<br />
                She <b>swims</b> in the sea <u>every summer</u>.
              </p>
              <p>
                Расписание:
                <br />
                The train <b>leaves</b> <u>at 7</u>.<br />
                The TV show <b>starts</b> <u>in 15 minutes</u>
              </p>
            </td>
          </tr>
          <tr>
            <td>Слова-маркеры</td>
            <td>
              Always, usually, sometimes, often, never, every
              day/week/month/year, once/twice/three times a day/week/month/year.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  ),
  "present-continuous": (
    <div>
      <table>
        <tbody>
          <tr>
            <td>Время</td>
            <td>
              <h2>Present Continuous</h2>
            </td>
          </tr>
          <tr>
            <td>Формула</td>
            <td>
              <table>
                <thead>
                  <tr>
                    <th>&nbsp;</th>
                    <th>+</th>
                    <th>-</th>
                    <th>?</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <u>I</u>
                    </td>
                    <td>am Ving</td>
                    <td>am not Ving</td>
                    <td>Am I Ving?</td>
                  </tr>
                  <tr>
                    <td>
                      <u>He/she/it</u>
                    </td>
                    <td>is Ving</td>
                    <td>is not Ving / isn't Ving</td>
                    <td>Is ___ Ving?</td>
                  </tr>
                  <tr>
                    <td>
                      <u>You/we/they</u>
                    </td>
                    <td>are Ving</td>
                    <td>are not Ving / aren't Ving</td>
                    <td>Are ___ Ving?</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td>Употребление/примеры</td>
            <td>
              <p>
                <b>Прямо сейчас:</b>
                <br />I am learning English tenses at the moment.
              </p>
              <p>
                <b>Планы на будущее:</b>
                <br />
                We are visiting our grandparents at the weekend.
              </p>
              <p>
                <b>Раздражение:</b>
                <br />
                She is always crying, I'm fed up with it!
              </p>
              <p>
                <b>Временные ситуации:</b>
                <br />
                This week I am studying for my exams.
              </p>
            </td>
          </tr>
          <tr>
            <td>Слова-маркеры</td>
            <td>
              At the moment, (right) now, always, constantly (раздражение), this
              week/month/year, today.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  ),
  "present-perfect": (
    <div>
      <table>
        <tbody>
          <tr>
            <td>Время</td>
            <td>
              <h2>Present Perfect</h2>
            </td>
          </tr>
          <tr>
            <td>Формула</td>
            <td>
              <table>
                <thead>
                  <tr>
                    <th>&nbsp;</th>
                    <th>+</th>
                    <th>-</th>
                    <th>?</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <u>I/you/we/they</u>
                    </td>
                    <td>have V3/Ved</td>
                    <td>have not V3/Ved / haven't V3/Ved</td>
                    <td>Have ___ V3/Ved?</td>
                  </tr>
                  <tr>
                    <td>
                      <u>He/she/it</u>
                    </td>
                    <td>has V3/Ved</td>
                    <td>has not V3/Ved / hasn't V3/Ved</td>
                    <td>Has ___ V3/Ved?</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td>Употребление/примеры</td>
            <td>
              <p>
                <b>Есть результат (время неизвестно/неважно):</b>
                <br />I have lost my keys.
                <br />
                She has broken the vase.
              </p>
              <p>
                <b>
                  Действие произошло в период времени, который ещё не
                  закончился:
                </b>
                <br />
                Have you seen Mark today?
                <br />
                She has been abroad this month.
              </p>
            </td>
          </tr>
          <tr>
            <td>Слова-маркеры</td>
            <td>
              Already, yet, just, recently, lately, ever, never, today, this
              week/month/year.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  ),
  "past-simple": (
    <div>
      <table>
        <tbody>
          <tr>
            <td>Время</td>
            <td>
              <h2>Past Simple</h2>
            </td>
          </tr>
          <tr>
            <td>Формула</td>
            <td>
              <table>
                <thead>
                  <tr>
                    <th>&nbsp;</th>
                    <th>+</th>
                    <th>-</th>
                    <th>?</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <u>I/you/we/they/he/she/it</u>
                    </td>
                    <td>V2/Ved</td>
                    <td>did not V / didn't V</td>
                    <td>Did ___ V?</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td>Употребление/примеры</td>
            <td>
              <p>
                <b>
                  Действия в прошлом, часто с указанием времени ({">=24"} часа):
                </b>
                <br />I visited Paris 5 years ago.
                <br />
                She swam in the sea for the first time last summer.
              </p>
              <p>
                <b>Последовательные действия в прошлом:</b>
                <br />
                Ann cleaned her teeth, had breakfast, got dressed and left for
                work.
              </p>
            </td>
          </tr>
          <tr>
            <td>Слова-маркеры</td>
            <td>
              Yesterday, last week/month/year, 2 days/1 week/4 months/10 years
              ago, in 1995.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  ),
  "past-continuous": (
    <div>
      <table>
        <tbody>
          <tr>
            <td>Время</td>
            <td>
              <h2>Past Continuous</h2>
            </td>
          </tr>
          <tr>
            <td>Формула</td>
            <td>
              <table>
                <thead>
                  <tr>
                    <th>&nbsp;</th>
                    <th>+</th>
                    <th>-</th>
                    <th>?</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <u>I/he/she/it</u>
                    </td>
                    <td>was Ving</td>
                    <td>was not Ving / wasn't Ving</td>
                    <td>Was ___ Ving?</td>
                  </tr>
                  <tr>
                    <td>
                      <u>You/we/they</u>
                    </td>
                    <td>were Ving</td>
                    <td>were not Ving / weren't Ving</td>
                    <td>Were ___ Ving?</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td>Употребление/примеры</td>
            <td>
              <p>
                <b>Действие в точное время в прошлом ({"<"}24 часов):</b>
                <br />I was watching a movie yesterday at 2pm.
                <br />
                This time last Friday we were driving to our dacha.
              </p>
              <p>
                <b>Действие в прошлом одновременно с другим действием.</b>{" "}
                Другое действие может быть ДЛИТЕЛЬНЫМ (Past Continuous) или
                коротким (Past Simple):
                <br />
                Mum was reading a newspaper while dad WAS WATCHING the news.
                <br />
                They were playing Monopoly when grandpa entered the room.
              </p>
            </td>
          </tr>
          <tr>
            <td>Слова-маркеры</td>
            <td>
              This time yesterday/last Friday, last Sunday evening/at 4pm, when,
              while.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  ),
  "past-perfect": (
    <div>
      <table>
        <tbody>
          <tr>
            <td>Время</td>
            <td>
              <h2>Past Perfect</h2>
            </td>
          </tr>
          <tr>
            <td>Формула</td>
            <td>
              <table>
                <thead>
                  <tr>
                    <th>&nbsp;</th>
                    <th>+</th>
                    <th>-</th>
                    <th>?</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <u>I/you/we/they/he/she/it</u>
                    </td>
                    <td>had V3/Ved</td>
                    <td>had not V3/Ved / hadn't V3/Ved</td>
                    <td>Had ___ V3/Ved?</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td>Употребление/примеры</td>
            <td>
              <p>
                <b>Действие ДО другого действия в прошлом:</b>
                <br />
                By the time we came home, dad had already left.
                <br />
                Yesterday I started reading the book I had bought.
              </p>
              <p>
                <b>
                  Действие, являющееся причиной другого действия/СОСТОЯНИЯ в
                  прошлом:
                </b>
                <br />
                Mary was crying because she had failed the exam.
                <br />
                Sam WAS HAPPY as he had won $100 000.
              </p>
            </td>
          </tr>
          <tr>
            <td>Слова-маркеры</td>
            <td>
              Before, after, by last Wednesday / by 3am / by the time, because,
              as (для указания причины), until.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  ),
  "future-simple": (
    <div>
      <table>
        <tbody>
          <tr>
            <td>Время</td>
            <td>
              <h2>Future Simple</h2>
            </td>
          </tr>
          <tr>
            <td>Формула</td>
            <td>
              <table>
                <thead>
                  <tr>
                    <th>&nbsp;</th>
                    <th>+</th>
                    <th>-</th>
                    <th>?</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <u>I/you/we/they/he/she/it</u>
                    </td>
                    <td>will V</td>
                    <td>will not V / won't V</td>
                    <td>Will ___ V?</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td>Употребление/примеры</td>
            <td>
              <p>
                <b>Обещания/Надежды:</b>
                <br />
                She promises she will come to visit us next week.
                <br />I hope you will pass the exam.
              </p>
              <p>
                <b>Спонтанные решения:</b>
                <br />
                Your bag looks heavy! I will carry it for you.
              </p>
              <p>
                <b>Предсказания из того, что мы знаем:</b>
                <br />
                Jim is the smartest boy in class, he will get everything right
                on his test.
              </p>
            </td>
          </tr>
          <tr>
            <td>Слова-маркеры</td>
            <td>
              Tomorrow, next Friday/week/month/year, in(через) a week/a month/5
              years.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  ),
  "adjectives-comparison": (
    <div>
      <p>
        В русском языке прилагательные изменяются по родам, числу и падежам
        (красивый, красивая, красивые, красивыми и т.д.). В английском языке
        прилагательные не изменяются. Однако можно образовать различные степени
        сравнения, как и в русском.
      </p>
      <p>
        Степени сравнения образуются двумя способами: к коротким словам
        добавляем суффиксы <b>-er</b> (=более) и <b>-est</b> (самый), к длинным
        слова <b>more</b> (=более) и <b>most</b> (=самый).
        <br />
        Например: tall - tall<b>er</b> - the tall<b>est</b>, interesting -{" "}
        <b>more</b> interesting - the <b>most</b> interesting.
      </p>
      <p>
        Короткие слова состоят из 1 слога (kind, slow, tall) или 2-х слогов,
        если оканчиваются на <b>-y</b> (happy, funny, crazy). Все остальные
        слова длинные (peaceful, interesting, dangerous).
      </p>
      <p>
        При образовании степеней сравнения коротких слов нужно помнить 3 правила
        написания:
        <ol>
          <li>
            Если слово оканчивается на согласная+гласная+согласная, то{" "}
            <b>последняя согласная</b> удваивается: thi<b>n</b> - thi<b>nn</b>
            er - the thi<b>nn</b>est.
          </li>
          <li>
            Если слово оканчивается на <b>-y</b>, то <b>-y</b> заменяется на{" "}
            <b>i</b>: happ<b>y</b> - happ<b>i</b>er - the happ<b>i</b>est.
          </li>
          <li>
            Если слово оканчивается на <b>-e</b>, то <b>-e</b> исчезает: nic
            <b>e</b> - nic<i>er</i> - the nic<i>est</i>.
          </li>
        </ol>
      </p>
      <p>
        Есть 2 исключения, которые очень часто встречаются в экзамене. Их нужно
        запомнить.
        <br />
        <b>
          Good – better – the best
          <br />
          Bad – worse – the worst.
        </b>
      </p>
      <p>
        При выполнении заданий обращайте внимание на следующие слова:
        <br />
        <i>than</i> после пропуска указывает на сравнительную степень (taller{" "}
        <i>than</i>, more interesting <i>than</i>);
        <br />
        <i>the</i> перед пропуском указывает на превосходную степень (<i>the</i>{" "}
        tallest, <i>the</i> most interesting).
      </p>
    </div>
  ),
  "would-v": (
    <div>
      <h5>Would+V (пример косвенной речи)</h5>
      <p>
        Косвенная речь — передача одним человеком речи другого.
        <br />
        Например: Мой друг сказал, что позвонит завтра.
      </p>
      <p>
        В русском языке глаголы <i>сказал, сообщила, объяснили</i> и т.д. не
        влияют на время глагола в самом высказывании.
        <br />
        Например: Катя сказала: «Мама <b>придёт</b> поздно» - Катя сказала, что
        мама <b>придёт</b> поздно.
      </p>
      <p>
        В английском же глаголы в прошедшем времени{" "}
        <i>сказал, сообщила, объяснили</i> и т.д. как бы отодвигают высказывание
        назад, поэтому время глагола в высказывании тоже меняется на «более
        прошедшее». Чаще всего первая форма глагола меняется на вторую.
      </p>
      <p>
        В таблице представлены наиболее употребимые формы глагола в косвенной
        речи. Постарайтесь понять логику изменений форм глаголов, а не заучивать
        их.
      </p>
      <table>
        <tbody>
          <tr>
            <th>Прямая речь</th>
            <th>Косвенная речь</th>
            <th>Пример предложения</th>
          </tr>
          <tr>
            <td>
              Present Simple
              <br />
              <b>(V/Vs)</b>
            </td>
            <td>
              Past Simple
              <br />
              <b>(V2/Ved)</b>
            </td>
            <td>
              He said, ‘I <b>like</b> meat.’ → He said that he <b>liked</b>{" "}
              meat.
            </td>
          </tr>
          <tr>
            <td>
              Future Simple
              <br />
              <b>(will V)*</b>
            </td>
            <td>
              Future in the past
              <br />
              <b>(would V)*</b>
            </td>
            <td>
              She exclaimed, ‘I <b>will cope</b> with it!’ → She exclaimed she{" "}
              <b>would cope</b> with that.*
            </td>
          </tr>
          <tr>
            <td>
              Past Simple
              <br />
              <b>(V2/Ved)</b>
            </td>
            <td>
              Past Perfect
              <br />
              <b>(had V3)</b>
            </td>
            <td>
              We answered, ‘We <b>were</b> there yesterday.’ → We answered we{" "}
              <b>had been</b> there the day before.
            </td>
          </tr>
          <tr>
            <td>
              Present Continuous
              <br />
              <b>(am/is/are Ving)</b>
            </td>
            <td>
              Past Continuous
              <br />
              <b>(was/were Ving)</b>
            </td>
            <td>
              They wondered, ‘<b>Are</b> you <b>working</b>?’ → They wondered if
              we <b>were working</b>.
            </td>
          </tr>
          <tr>
            <td>
              Past Continuous
              <br />
              <b>(was/were Ving)</b>
            </td>
            <td>
              Past Perfect Continuous
              <br />
              <b>(had been Ving)</b>
            </td>
            <td>
              She said, ‘I <b>was working</b> at 7pm yesterday.’ → She said she{" "}
              <b>had been working</b> at 7pm the day before.
            </td>
          </tr>
          <tr>
            <td>
              Present Perfect
              <br />
              <b>(have/has V3)</b>
            </td>
            <td>
              Past Perfect
              <br />
              <b>(had V3)</b>
            </td>
            <td>
              He said, ‘I <b>have lost</b> my credit card.’ → He said he{" "}
              <b>had lost</b> his credit card.
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        <i>
          *В ОГЭ проверяется знание правил косвенной речи именно в Future
          Simple, т.е. при раскрытии скобок нужно писать <b>would V</b> (go →
          would go, be → would be, come → would come).
        </i>
      </p>
    </div>
  ),
};
