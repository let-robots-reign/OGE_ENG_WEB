<template>
    <main>
        <AppBackFloatingButton/>

        <div class="card center">
            <BaseSelect
                    class="category-select"
                    label="Выберите категорию"
                    :options="categories"
                    v-model="chosenCategory"
            />
            <div v-if="editor" class="editor-menu">
                <button @click="editor.chain().focus().toggleBold().run()"
                        :class="['editor-btn', (editor.isActive('bold')) ? 'active' : 'inactive']">
                    <b>B</b>
                </button>
                <button @click="editor.chain().focus().toggleItalic().run()"
                        :class="['editor-btn', (editor.isActive('italic')) ? 'active' : 'inactive']">
                    <em>I</em>
                </button>
                <button @click="editor.chain().focus().toggleUnderline().run()"
                        :class="['editor-btn', (editor.isActive('underline')) ? 'active' : 'inactive']">
                    <u>U</u>
                </button>
                <button @click="editor.chain().focus().toggleStrike().run()"
                        :class="['editor-btn', (editor.isActive('strike')) ? 'active' : 'inactive']">
                    <span style="text-decoration: line-through;">S</span>
                </button>
                <button @click="editor.chain().focus().setParagraph().run()"
                        :class="['editor-btn', (editor.isActive('paragraph')) ? 'active' : 'inactive']">
                    p
                </button>
                <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
                        :class="['editor-btn', (editor.isActive('heading', { level: 1 })) ? 'active' : 'inactive']">
                    <span style="font-weight: 900;">H<span style="font-size: 10px">1</span></span>
                </button>
                <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
                        :class="['editor-btn', (editor.isActive('heading', { level: 2 })) ? 'active' : 'inactive']">
                    <span style="font-weight: 700;">H<span style="font-size: 10px">2</span></span>
                </button>
                <button @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
                        :class="['editor-btn', (editor.isActive('heading', { level: 3 })) ? 'active' : 'inactive']">
                    <span style="font-weight: 500;">H<span style="font-size: 10px">3</span></span>
                </button>
                <button @click="editor.chain().focus().setTextAlign('left').run()"
                        :class="['editor-btn', (editor.isActive({ textAlign: 'left' })) ? 'active' : 'inactive']">
                    <font-awesome-icon :icon="['fas', 'align-left']"/>
                </button>
                <button @click="editor.chain().focus().setTextAlign('center').run()"
                        :class="['editor-btn', (editor.isActive({ textAlign: 'center' })) ? 'active' : 'inactive']">
                    <font-awesome-icon :icon="['fas', 'align-center']"/>
                </button>
                <button @click="editor.chain().focus().setTextAlign('right').run()"
                        :class="['editor-btn', (editor.isActive({ textAlign: 'right' })) ? 'active' : 'inactive']">
                    <font-awesome-icon :icon="['fas', 'align-right']"/>
                </button>
                <button @click="editor.chain().focus().toggleBulletList().run()"
                        :class="['editor-btn', (editor.isActive('bulletList')) ? 'active' : 'inactive']">
                    <font-awesome-icon :icon="['fas', 'list-ul']"/>
                </button>
                <button @click="editor.chain().focus().toggleOrderedList().run()"
                        :class="['editor-btn', (editor.isActive('orderedList')) ? 'active' : 'inactive']">
                    <font-awesome-icon :icon="['fas', 'list-ol']"/>
                </button>
                <button @click="editor.chain().focus().toggleBlockquote().run()"
                        :class="['editor-btn', (editor.isActive('blockquote')) ? 'active' : 'inactive']">
                    <font-awesome-icon :icon="['fas', 'quote-right']"/>
                </button>
                <button @click="editor.chain().focus().undo().run()" class="editor-btn">
                    <font-awesome-icon :icon="['fas', 'undo']"/>
                </button>
                <button @click="editor.chain().focus().redo().run()" class="editor-btn">
                    <font-awesome-icon :icon="['fas', 'redo']"/>
                </button>
            </div>
            <editor-content :editor="editor" class="editor"/>
        </div>

        <button class="btn primary save-btn" @click="saveArticle">{{ (isEditing) ? 'Обновить' : 'Сохранить' }}</button>
    </main>
</template>

<script>
import {EditorContent, useEditor} from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Focus from '@tiptap/extension-focus';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import BaseSelect from '@/components/form/BaseSelect';
import {getCategories, getCategoryName, getCategorySlug} from '@/utils/theoryCategories';
import {ref} from 'vue';
import {API} from '@/services/api';
import {useRouter} from 'vue-router';
import AppBackFloatingButton from '@/components/AppBackFloatingButton';

export default {
    name: 'CreateTheory',
    components: {BaseSelect, EditorContent, AppBackFloatingButton},
    props: {
        isEditing: {
            type: [Boolean, String],
            default: false,
        },
        articleID: {
            type: String,
            default: '',
        },
        articleCategory: {
            type: String,
            default: '',
        },
        initialContent: {
            type: String,
            default: '',
        },
    },
    setup(props) {
        const router = useRouter();
        const categories = ref(getCategories());
        const chosenCategory = (props.articleCategory) ?
            ref(getCategoryName(props.articleCategory)) : ref(getCategories()[0]);

        const editor = useEditor({
            extensions: [
                StarterKit,
                Underline,
                Placeholder.configure({
                    placeholder: ({node}) => {
                        if (node.type.name === 'heading') {
                            return 'Заголовок';
                        }

                        return 'Введите текст...';
                    },
                }),
                Focus.configure({
                    className: 'has-focus',
                    mode: 'all',
                }),
                TextAlign.configure({
                    types: ['heading', 'paragraph'],
                }),
            ],
            autofocus: true,
            content: props.initialContent || `
            <h2></h2>
            <p>
                Вставьте текст теоретической карточки
            </p>
            `,
        });

        const saveArticle = () => {
            const parsed = new DOMParser().parseFromString(editor.value.getHTML(), 'text/html');
            const title = parsed.body.firstChild.textContent;
            const article = {
                category: getCategorySlug(chosenCategory.value),
                title,
                content: editor.value.getHTML(),
            };
            if (props.isEditing) {
                article.id = props.articleID;
            }
            const method = (props.isEditing) ?
                API.updateTheoryArticle(article, props.articleID) : API.createTheoryArticle(article);
            method
                .then(() => router.back())
                .catch((err) => console.log(err));
        };

        return {
            categories,
            chosenCategory,
            editor,
            saveArticle,
        };
    },
};
</script>

<style lang="scss" scoped>
@import "@/_variables.scss";
@import url('https://css.gg/undo.css');
@import url('https://css.gg/redo.css');

main {
  flex-grow: 1;
  margin: 32px auto;
}

.category-select {
  align-self: start;
  margin-top: 12px;
  margin-bottom: 32px;
}

.editor {
  width: 100%;
}

.editor-menu {
  width: 100%;
  display: flex;
  gap: 4px;
  justify-content: center;
}

.editor-btn {
  min-width: 28px;
  min-height: 28px;
  font-size: 18px;
  font-family: inherit;
  background-color: $white;
  outline: none;
  border: 1px solid transparent;

  &:hover, &.active {
    background-color: #eee;
  }
}

.save-btn {
  width: 100%;
  height: 50px;
  border-radius: 8px;
  font-size: 18px;
}
</style>

<style lang="scss">
/* Basic editor styles */
.ProseMirror {
  padding: 16px;
  margin-top: 12px;
  border: 2px solid transparent;
  border-radius: 8px;

  > * + * {
    margin-top: 0.75em;
  }

  &-focused {
    outline: none;
    border-color: #D9D9D9;
  }

  ul,
  ol {
    padding: 0 1rem;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    line-height: 1.1;
  }

  code {
    background-color: rgba(#616161, 0.1);
    color: #616161;
  }

  pre {
    background: #0D0D0D;
    color: #FFF;
    font-family: 'JetBrainsMono', monospace;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;

    code {
      color: inherit;
      padding: 0;
      background: none;
      font-size: 0.8rem;
    }
  }

  img {
    max-width: 100%;
    height: auto;
  }

  blockquote {
    padding-left: 1rem;
    border-left: 2px solid rgba(#0D0D0D, 0.1);
  }

  hr {
    border: none;
    border-top: 2px solid rgba(#0D0D0D, 0.1);
    margin: 2rem 0;
  }
}

.ProseMirror .is-empty::before {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}
</style>