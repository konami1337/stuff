#! /bin/bash
# Scott Knight
#
# Based on the script by Brandon Azad
# https://gist.github.com/bazad/654959120a423b226dc564073b435453
#

# Set the working directory.
WORKDIR="${WORKDIR:-build-xnu-6153.141.1}"

# Set a permissive umask just in case.
umask 022

# Print commands and exit on failure.
set -ex

# Get the SDK path and toolchain path.
SDKPATH="$(xcrun --sdk iphoneos --show-sdk-path)"
TOOLCHAINPATH="$(xcode-select -p)/Toolchains/XcodeDefault.xctoolchain"
[ -d "${SDKPATH}" ] && [ -d "${TOOLCHAINPATH}" ]

# Create the working directory.
mkdir "${WORKDIR}"
cd "${WORKDIR}"

# Back up the SDK if that option is given.
if [ -n "${BACKUP_SDK}" ]; then
	sudo ditto "${SDKPATH}" "$(basename "${SDKPATH}")"
fi

# Download XNU and some additional sources we will need to help build.
git clone https://github.com/konami1337/darm64
curl https://opensource.apple.com/tarballs/dtrace/dtrace-338.0.1.tar.gz | tar -xf-
curl https://opensource.apple.com/tarballs/AvailabilityVersions/AvailabilityVersions-45.tar.gz | tar -xf-
curl https://opensource.apple.com/tarballs/libplatform/libplatform-220.tar.gz | tar -xf-
curl https://opensource.apple.com/tarballs/libdispatch/libdispatch-1173.0.3.tar.gz | tar -xf-

# Build and install ctf utilities. This adds the ctf tools to
# ${TOOLCHAINPATH}/usr/local/bin.
cd dtrace-338.0.1
cd include/llvm-Support
rm PointerLikeTypeTraits.h
curl https://gist.githubusercontent.com/knightsc/cf46670ea023168cdfe98b4a295f2cf4/raw/00f0b13c00983e4010ba0019eeeecb0ba9a381e7/PointerLikeTypeTraits.h > PointerLikeTypeTraits.h
curl https://gist.githubusercontent.com/knightsc/fe2cbe276a006fe601b704cd5286047f/raw/bb44a1b8cbfa22a8d814368189a193394b9cfe4c/DataTypes.h > DataTypes.h
cd ../..
mkdir -p obj dst sym
xcodebuild install -target ctfconvert -target ctfdump -target ctfmerge -UseModernBuildSystem=NO ARCHS="x86_64" SDKROOT=macosx SRCROOT="${PWD}" OBJROOT="${PWD}/obj" SYMROOT="${PWD}/sym" DSTROOT="${PWD}/dst"
# TODO: Get the XcodeDefault.toolchain path programmatically.
sudo ditto "${PWD}/dst/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain" "${TOOLCHAINPATH}"
cd ..

# Install AvailabilityVersions. This writes to ${SDKPATH}/usr/local/libexec.
cd AvailabilityVersions-45
mkdir -p dst
make install SRCROOT="${PWD}" DSTROOT="${PWD}/dst"
sudo ditto "${PWD}/dst/usr/local" "${SDKPATH}/usr/local"
cd ..

# Install the XNU headers we'll need for libdispatch. This OVERWRITES files in
cd darm64
mkdir -p BUILD.hdrs/obj BUILD.hdrs/sym BUILD.hdrs/dst
make installhdrs SDKROOT=iphoneos ARCH_CONFIGS=ARM64 KERNEL_CONFIGS=RELEASE DISABLE_EDM=1 SRCROOT="${PWD}" OBJROOT="${PWD}/BUILD.hdrs/obj" SYMROOT="${PWD}/BUILD.hdrs/sym" DSTROOT="${PWD}/BUILD.hdrs/dst"
sudo ditto BUILD.hdrs/dst "${SDKPATH}"
cd ..

# Install libplatform headers to ${SDKPATH}/usr/local/include.
cd libplatform-220
sudo ditto "${PWD}/include" "${SDKPATH}/usr/local/include"
sudo ditto "${PWD}/private"  "${SDKPATH}/usr/local/include"
cd ..

# Build and install libdispatch's libfirehose_kernel target to
# ${SDKPATH}/usr/local.
cd libdispatch-1173.0.3
mkdir -p obj sym dst
xcodebuild install -project libdispatch.xcodeproj -target libfirehose_kernel -sdk iphoneos -UseModernBuildSystem=NO ENABLE_BITCODE=NO ARCHS="arm64" SRCROOT="${PWD}" OBJROOT="${PWD}/obj" SYMROOT="${PWD}/sym" DSTROOT="${PWD}/dst"
sudo ditto "${PWD}/dst/usr/local" "${SDKPATH}/usr/local"
cd ..

# Build XNU.
cd xnu-6153.141.1
make SDKROOT=iphoneos ARCH_CONFIGS=ARM64 KERNEL_CONFIGS=RELEASE BUILD_WERROR=0 BUILD_STABS=1 DISABLE_EDM=1 BUILD_JSON_COMPILATION_DATABASE=1 -j4
