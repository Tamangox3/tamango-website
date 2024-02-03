import type { ChainModifiers, Entry, EntryFieldTypes, EntrySkeletonType, LocaleCode } from "contentful";

/**
 * Fields type definition for content type 'TypePage'
 * @name TypePageFields
 * @type {TypePageFields}
 * @memberof TypePage
 */
export interface TypePageFields {
    /**
     * Field type definition for field 'internalTitle' (Titolo interno)
     * @name Titolo interno
     * @localized false
     */
    internalTitle: EntryFieldTypes.Symbol;
    /**
     * Field type definition for field 'slug' (Slug)
     * @name Slug
     * @localized false
     */
    slug: EntryFieldTypes.Symbol;
    /**
     * Field type definition for field 'layout' (Layout)
     * @name Layout
     * @localized false
     */
    layout: EntryFieldTypes.Symbol<"Standard">;
    /**
     * Field type definition for field 'ogImage' (Immagine SEO)
     * @name Immagine SEO
     * @localized false
     */
    ogImage: EntryFieldTypes.AssetLink;
    /**
     * Field type definition for field 'ogTitle' (Titolo SEO)
     * @name Titolo SEO
     * @localized false
     */
    ogTitle: EntryFieldTypes.Symbol;
    /**
     * Field type definition for field 'ogDescription' (Descrizione SEO)
     * @name Descrizione SEO
     * @localized false
     */
    ogDescription?: EntryFieldTypes.Text;
    /**
     * Field type definition for field 'keywords' (Keywords)
     * @name Keywords
     * @localized false
     */
    keywords?: EntryFieldTypes.Array<EntryFieldTypes.Symbol>;
    /**
     * Field type definition for field 'title' (Titolo)
     * @name Titolo
     * @localized false
     */
    title?: EntryFieldTypes.Symbol;
    /**
     * Field type definition for field 'content' (Contenuto)
     * @name Contenuto
     * @localized false
     */
    content: EntryFieldTypes.RichText;
}

/**
 * Entry skeleton type definition for content type 'page' (Pagina)
 * @name TypePageSkeleton
 * @type {TypePageSkeleton}
 * @author 7oIhVVln1MoQRobu38qPiN
 * @since 2024-01-13T15:44:24.235Z
 * @version 13
 */
export type TypePageSkeleton = EntrySkeletonType<TypePageFields, "page">;
/**
 * Entry type definition for content type 'page' (Pagina)
 * @name TypePage
 * @type {TypePage}
 * @author 7oIhVVln1MoQRobu38qPiN
 * @since 2024-01-13T15:44:24.235Z
 * @version 13
 */
export type TypePage<Modifiers extends ChainModifiers, Locales extends LocaleCode> = Entry<TypePageSkeleton, Modifiers, Locales>;

export function isTypePage<Modifiers extends ChainModifiers, Locales extends LocaleCode>(entry: Entry<EntrySkeletonType, Modifiers, Locales>): entry is TypePage<Modifiers, Locales> {
    return entry.sys.contentType.sys.id === 'page'
}
