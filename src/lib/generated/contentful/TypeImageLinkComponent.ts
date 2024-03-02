import type { ChainModifiers, Entry, EntryFieldTypes, EntrySkeletonType, LocaleCode } from "contentful";

/**
 * Fields type definition for content type 'TypeImageLinkComponent'
 * @name TypeImageLinkComponentFields
 * @type {TypeImageLinkComponentFields}
 * @memberof TypeImageLinkComponent
 */
export interface TypeImageLinkComponentFields {
    /**
     * Field type definition for field 'url' (URL)
     * @name URL
     * @localized false
     */
    url: EntryFieldTypes.Symbol;
    /**
     * Field type definition for field 'image' (Immagine)
     * @name Immagine
     * @localized false
     */
    image: EntryFieldTypes.AssetLink;
}

/**
 * Entry skeleton type definition for content type 'imageLinkComponent' (Componente: Immagine + link)
 * @name TypeImageLinkComponentSkeleton
 * @type {TypeImageLinkComponentSkeleton}
 * @author 7oIhVVln1MoQRobu38qPiN
 * @since 2024-03-02T18:18:35.127Z
 * @version 1
 */
export type TypeImageLinkComponentSkeleton = EntrySkeletonType<TypeImageLinkComponentFields, "imageLinkComponent">;
/**
 * Entry type definition for content type 'imageLinkComponent' (Componente: Immagine + link)
 * @name TypeImageLinkComponent
 * @type {TypeImageLinkComponent}
 * @author 7oIhVVln1MoQRobu38qPiN
 * @since 2024-03-02T18:18:35.127Z
 * @version 1
 */
export type TypeImageLinkComponent<Modifiers extends ChainModifiers, Locales extends LocaleCode> = Entry<TypeImageLinkComponentSkeleton, Modifiers, Locales>;

export function isTypeImageLinkComponent<Modifiers extends ChainModifiers, Locales extends LocaleCode>(entry: Entry<EntrySkeletonType, Modifiers, Locales>): entry is TypeImageLinkComponent<Modifiers, Locales> {
    return entry.sys.contentType.sys.id === 'imageLinkComponent'
}
