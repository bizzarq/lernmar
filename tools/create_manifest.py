from typing import Optional
import os
import posixpath
import uuid
from xml.etree import ElementTree


def create_manifest(path: str, name: Optional[str]=None, entry: Optional[str]=None):
    """
    creates a SCORM manifest file for a course.
    @param path path of course. this should be a directory with the course content.
    @param name name (title) of course. directory name if omitted or None. 
    @param entry posix style relative path of entry file. index.html if omitted or None.
    """
    if not os.path.isdir(path):
        raise Exception(f'cannot access course in {path}')
    if name is None:
        name = os.path.basename(os.path.abspath(path))
    if entry is None:
        entry = 'index.html'
    entry_path = os.path.join(path, entry)
    if not os.path.isfile(entry_path):
        raise Exception(f'cannot find entry document in {entry_path}')

    manifest = ElementTree.Element('manifest')
    _add_metadata(manifest)
    _add_organizations(manifest, name=name)
    _add_resources(manifest, path=path, entry=entry)


    filename = os.path.join(path, 'imsmanifest.xml')
    tree = ElementTree.ElementTree(manifest)
    ElementTree.indent(tree)
    tree.write(filename, encoding='UTF-8', xml_declaration=True)

def _add_metadata(parent: ElementTree.Element):
    md_attributes = {
        # creating a globally unique identifier, should be configurable in future
        'identifier': uuid.uuid4().hex,
        # version should also be configurable
        'version': '1'
    }
    metadata = ElementTree.SubElement(parent, 'metadata', attrib=md_attributes)
    schema = ElementTree.SubElement(metadata, 'schema')
    schema.text = 'ADL SCORM'
    schemaversion = ElementTree.SubElement(metadata, 'schemaversion')
    schemaversion.text = '2004 4th Edition'
    return metadata

def _add_organizations(parent: ElementTree.Element, name: str):
    organizations = ElementTree.SubElement(parent, 'organizations', attrib={'default': name})
    organization = ElementTree.SubElement(
        organizations, 'organization', attrib={
            'identifier': name, 'adlseq:objectivesGlobalToSystem': 'false'})
    title = ElementTree.SubElement(organization, 'title')
    title.text = name

    item_attributes = {
        # we only support one-activity courses. hence there is only one item we call 'item'
        'identifier': 'item',
        # and item is based on a resource we call 'resource'
        'identifierref': 'resource'
    }
    item = ElementTree.SubElement(organization, 'item', attrib=item_attributes)
    item_title = ElementTree.SubElement(item, 'title')
    item_title.text = name

def _add_resources(parent: ElementTree.ElementTree, path: str, entry: str):
    resources = ElementTree.SubElement(parent, 'resources')
    resource_attributes = {
        # cf. identifierref in organizations
        'identifier': 'resource',
        'type': 'webcontent',
        'adlcp:scormType': "sco",
        'href': entry,
    }
    resource = ElementTree.SubElement(resources, 'resource', attrib=resource_attributes)
    dir_todos = [(path, '')]
    ignores = {'imsmanifest.xml'}
    while dir_todos:
        path1, path2 = dir_todos.pop(0)
        print(f'process {path1} {path2}')
        if path2 in ignores:
            path
        elif os.path.isdir(path1):
            new_todos = []
            for name in sorted(os.listdir(path1)):
                new_todos.append((os.path.join(path1, name), posixpath.join(path2, name)))
            dir_todos[0:0] = new_todos
        elif os.path.isfile(path1):
            ElementTree.SubElement(resource, 'file', attrib={'href': path2})

    pass

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(
        description='creates a SCORM manifest file for a course.')
    parser.add_argument('path',
        help='path of course. this should be a directory with the course content')
    parser.add_argument('--name', '-n', 
        help='name (title) of course. directory name if omitted.')
    parser.add_argument('-e', '--entry',
        help='relative path of entry file. default is index.html')
    args = parser.parse_args()

    create_manifest(args.path, args.name, args.entry)
