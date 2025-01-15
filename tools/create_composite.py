from typing import Optional
import shutil
import os
import sys

from course_index import CourseIndex
from create_manifest import create_manifest


def log(message: str) -> None:
    """
    logs a message to stderr.
    @param message message to log.
    """
    print(message, file=sys.stderr)

def create_composite(path: str, sub_course_dirs: list[str], name: Optional[str]=None):
    """
    creates a composite SCORM course from two or more courses. it can also add new elements to
    an existing composite course (without changing the order of sub-courses).
    @param path path of result course. if it exists already new courses are added to the existing one.
    @param sub_course_dirs directories of sub-courses to create composite from.
    @param name name (title) of course. directory name if omitted or None.
    """
    courses_dir = os.path.join(path, 'courses')
    if not os.path.isdir(courses_dir):
        os.makedirs(courses_dir)

    _create_index(courses_dir, sub_course_dirs)
    _copy_lernmar_files(path)

    if name is None:
        name = os.path.basename(os.path.abspath(path))
    create_manifest(path, name=name)

def _create_index(courses_dir: str, sub_course_dirs: list[str]):
    """
    creates index.json file for a composite course and copies sub-courses to the courses directory.
    @param courses_dir path of courses directory.
    @param sub_course_dirs directories of sub-courses to create composite from.
    """
    index = CourseIndex(courses_dir)
    index.read()
    # delete index entries of deleted paths
    for course in index:
        abs_path = os.path.join(courses_dir, course['path'])
        if not os.path.isdir(abs_path):
            index.remove_course(course)
    # copy sub-courses to courses directory
    for sub_course_dir in sub_course_dirs:
        basename = os.path.basename(os.path.abspath(sub_course_dir))
        manifest_path = os.path.join(sub_course_dir, 'imsmanifest.xml')
        if not os.path.isfile(manifest_path):
            log(f'ignoring sub-course {basename} without manifest')
            continue
        dst_dir = os.path.join(courses_dir, basename)
        if os.path.isdir(dst_dir):
            # delete destination path for avoiding a mix of old and new content
            shutil.rmtree(dst_dir)
        shutil.copytree(sub_course_dir, dst_dir)
        index.from_course(dst_dir)
    # write index
    index.write()

def _copy_lernmar_files(path: str):
    """
    copies Lernmar files to a course directory.
    @param path path of course directory.
    """
    root_dir = os.path.dirname(os.path.abspath(os.path.dirname(__file__)))
    src_dir = os.path.join(root_dir, 'run', 'composite')
    items = ['index.html', 'lernmar.svg', 'main.css', 'js']
    for item in items:
        src_path = os.path.join(src_dir, item)
        if os.path.isfile(src_path):
            shutil.copy2(src_path, path)
        elif os.path.isdir(src_path):
            dst_path = os.path.join(path, item)
            if os.path.isdir(dst_path):
                shutil.rmtree(dst_path)
            shutil.copytree(src_path, os.path.join(path, item))
        else:
            raise Exception(f'cannot find {item} in {src_dir}')


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(
        description='creates a composite course from two or more scorm courses.')
    parser.add_argument('path',
        help='path of result course.')
    parser.add_argument('sub_course_dirs', nargs='+',
        help='directories of sub-courses to create composite from.')
    parser.add_argument('--name', '-n',
        help='name (title) of course. directory name if omitted.')
    args = parser.parse_args()

    create_composite(args.path, args.sub_course_dirs, name=args.name)
